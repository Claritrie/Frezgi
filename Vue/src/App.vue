<template>
  <div id="app">
    <!-- Color Settings Panel (Auto-hiding on left side) -->
    <div class="color-settings-panel" :class="{ 'hidden': !showColorPanel }">
      <!-- Logo at top -->
      <div class="panel-logo">
        <img src="https://imgur.com/dlnsBR8.png" alt="Frezgi Logo" class="company-logo">
      </div>
      
      <div class="color-picker-container">
        <!-- Canvas Background Color -->
        <div class="color-picker-item">
          <label for="canvas-color">Canvas:</label>
          <input
            id="canvas-color"
            type="color"
            v-model="canvasColor"
            class="color-input"
          />
        </div>
        
        <!-- Compact Node Colors (Background + Text) -->
        <div class="color-picker-section">
          <h4>Node/Text Colors</h4>
          <div v-for="(_, type) in nodeColors" :key="`node-${type}`" class="color-picker-row">
            <span class="node-type-label">{{ getNodeTypeLabel(type) }}:</span>
            <div class="color-inputs">
              <input
                :id="`bg-${type}`"
                type="color"
                v-model="nodeColors[type]"
                @change="ensureReadableText(type); updateEdgeColors()"
                class="color-input"
                :title="getNodeTypeLabel(type) + ' background'"
              />
              <input
                :id="`text-${type}`"
                type="color"
                v-model="textColors[type]"
                @change="ensureReadableText(type); saveColorScheme()"
                class="color-input"
                :title="getNodeTypeLabel(type) + ' text'"
              />
            </div>
          </div>
          <!-- Reset button moved up here -->
          <button @click="resetColorScheme" class="color-panel-btn reset-btn">Reset Colors</button>
        </div>
      </div>
      
      <!-- Version at bottom -->
      <div class="version-info">v0.1.0</div>
    </div>
    
    <!-- Toggle Button for Color Panel -->
    <button @click="toggleColorPanel" class="toggle-panel-btn" :class="{ 'panel-open': showColorPanel }">
      {{ showColorPanel ? '◀' : '▶' }}
    </button>

    <!-- Help Button (reopens the welcome guide) -->
    <button
      @click="openGuide"
      class="help-btn"
      aria-label="Open the guide"
      title="What is Frezgi and how do I use it?"
    >?</button>

    <!-- Legend: what each node type means -->
    <aside class="legend" :class="{ collapsed: legendCollapsed }" aria-label="Key">
      <button
        type="button"
        class="legend-toggle"
        :aria-expanded="String(!legendCollapsed)"
        @click="toggleLegend"
      >Key {{ legendCollapsed ? '▴' : '▾' }}</button>
      <ul v-if="!legendCollapsed">
        <li v-for="item in legendItems" :key="item.type">
          <span class="legend-swatch" :style="{ backgroundColor: nodeColors[item.type] }"></span>
          <span><strong>{{ item.name }}</strong>: {{ item.meaning }}</span>
        </li>
      </ul>
    </aside>

    <!-- Welcome Guide -->
    <div v-if="showGuide" class="guide-backdrop" @click.self="closeGuide">
      <div class="guide" role="dialog" aria-modal="true" aria-labelledby="guide-title">
        <h2 id="guide-title">Welcome to Frezgi</h2>
        <p class="guide-intro">
          Frezgi helps you think a statement through. You write the statement,
          then map the reasons that support it, the reasons that oppose it,
          and the points that need more thought.
        </p>

        <h3>How it helps</h3>
        <ul>
          <li>You see every side of an issue in one place.</li>
          <li>Each reason has its own box, so you can judge it on its own.</li>
          <li>You find weak points and open questions before you decide.</li>
        </ul>

        <h3>How to use it</h3>
        <ol>
          <li>Double-click <strong>Main Resolution</strong> and write the statement you want to examine.</li>
          <li>Hover over any box and choose 👍 to support it, 👎 to oppose it, or ✋ to explore it further.</li>
          <li>Drag the boxes to arrange your map.</li>
          <li>To remove a box, drag it onto the box it came from. Its sub-points are removed with it.</li>
          <li>Move your pointer to the left edge of the screen to change the colours.</li>
        </ol>

        <p class="guide-note">Note: your map is not saved when you close or reload the page.</p>

        <button ref="guideStartBtn" @click="closeGuide" class="popup-btn confirm-btn">Start mapping</button>
      </div>
    </div>

    <div ref="canvas" class="canvas" :style="{ backgroundColor: canvasColor }">
      <!-- SVG Lines -->
      <svg class="lines">
        <path
          v-for="(edge, index) in edges"
          :key="`edge-${index}-${refreshTrigger}`"
          :d="calculatePath(edge.source, edge.target)"
          :stroke="edge.color"
          :class="{ 'will-delete': isPendingDelete(edge.target) }"
          fill="transparent"
          stroke-width="2"
        />
      </svg>

      <!-- Main Resolution Node -->
      <div
        class="node resolution-node"
        :class="{ 'drop-target': pendingDelete && pendingDelete.parentId === resolutionNode.id }"
        :style="{ 
          top: resolutionNode.position.y + 'px', 
          left: resolutionNode.position.x + 'px',
          backgroundColor: nodeColors.resolution,
          color: textColors.resolution
        }"
        @mousedown="startDrag($event, resolutionNode)"
        @mouseover="showEmojiMenu(resolutionNode)"
        @mouseleave="hideEmojiMenu(resolutionNode)"
        @dblclick="editNodeText(resolutionNode)"
      >
        {{ resolutionNode.text }}
        <div v-if="resolutionNode.showEmojis && !showPopup" class="emoji-menu">
          <button
            v-for="action in nodeActions"
            :key="action.type"
            type="button"
            class="emoji-btn"
            :aria-label="action.label"
            :data-tip="action.label"
            @mousedown.stop
            @click="openPopup(action.type, resolutionNode)"
          >{{ action.emoji }}</button>
        </div>
      </div>

      <!-- Child Nodes -->
      <div
        v-for="(node, index) in childNodes"
        :key="node.id"
        :class="[`node ${node.type}`, {
          dragging: draggingNode === node,
          'will-delete': isPendingDelete(node.id),
          'drop-target': pendingDelete && pendingDelete.parentId === node.id
        }]"
        :style="{ 
          top: node.position.y + 'px', 
          left: node.position.x + 'px',
          backgroundColor: nodeColors[node.type],
          color: textColors[node.type]
        }"
        @mousedown="startDrag($event, node)"
        @mouseover="showEmojiMenu(node)"
        @mouseleave="hideEmojiMenu(node)"
        @dblclick="editNodeText(node)"
      >
        {{ node.text }}
        <div v-if="node.showEmojis && !showPopup" class="emoji-menu">
          <button
            v-for="action in nodeActions"
            :key="action.type"
            type="button"
            class="emoji-btn"
            :aria-label="action.label"
            :data-tip="action.label"
            @mousedown.stop
            @click="openPopup(action.type, node)"
          >{{ action.emoji }}</button>
        </div>
      </div>

      <!-- Shown while a dragged box is over its parent and will be removed -->
      <p
        v-if="pendingDelete && draggingNode"
        class="delete-badge"
        role="status"
        :style="{
          top: draggingNode.position.y - 34 + 'px',
          left: draggingNode.position.x + nodeWidth / 2 + 'px'
        }"
      >{{ pendingDeleteMessage }}</p>

      <!-- First-step hint, shown until the first point is added -->
      <p
        v-if="childNodes.length === 0 && !showGuide"
        class="empty-hint"
        :style="{
          top: resolutionNode.position.y + nodeWithEmojiHeight + 12 + 'px',
          left: resolutionNode.position.x - 55 + 'px',
          color: hintColor
        }"
      >
        Hover over the box above to add your first point.<br />
        Double-click any box to edit its text.
      </p>

    </div>

    <!-- Dialog for adding a point or editing a box -->
    <div v-if="showPopup" class="popup-backdrop" @mousedown.self="closePopup">
      <div class="popup" role="dialog" aria-modal="true">
        <label>
          {{ getPopupLabel(newNode.type) }}
          <input
            v-model="newNode.text"
            type="text"
            :placeholder="popupMode === 'edit' ? 'Type the new text here...' : 'Type your point here...'"
            ref="newNodeInput"
            :aria-invalid="popupError ? 'true' : 'false'"
            aria-describedby="popup-error"
            @input="popupError = ''"
            @keydown.enter="submitPopup"
          />
        </label>
        <p id="popup-error" class="popup-error" aria-live="polite">{{ popupError }}</p>
        <div class="popup-buttons">
          <button @click="submitPopup" class="popup-btn confirm-btn">{{ popupMode === 'edit' ? 'Save' : 'Add' }}</button>
          <button @click="closePopup" class="popup-btn cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      resolutionNode: {
        id: "resolution",
        position: { x: 300, y: 100 },
        showEmojis: false,
        text: "Main Resolution",
      },
      childNodes: [],
      edges: [],
      draggingNode: null,
      // Set while a dragged box overlaps its parent: { nodeId, parentId, ids }
      pendingDelete: null,
      showPopup: false,
      popupMode: "add", // "add" a new point, or "edit" an existing box
      popupError: "",
      editingNode: null,
      newNode: { type: "", text: "", color: "", parent: null },
      // All color settings (9 total)
      canvasColor: "#000000", // Canvas background color
      nodeColors: {
        resolution: "#FFFFFF", // Main node background
        pro: "#008000",       // Supporting node background
        con: "#FF0000",       // Opposing node background
        exp: "#FFFF00",       // Exploring node background
      },
      textColors: {
        resolution: "#000000", // Main node text
        pro: "#FFFFFF",       // Supporting node text
        con: "#FFFFFF",       // Opposing node text
        exp: "#000000",       // Exploring node text
      },
      // Default colors for reset
      defaultColors: {
        canvas: "#000000",
        nodeColors: {
          resolution: "#FFFFFF",
          pro: "#008000",
          con: "#FF0000",
          exp: "#FFFF00",
        },
        textColors: {
          resolution: "#000000",
          pro: "#FFFFFF",
          con: "#FFFFFF",
          exp: "#000000",
        }
      },
      // Fixed node dimensions
      nodeWidth: 150,
      nodeBaseHeight: 40,
      nodeWithEmojiHeight: 80,
      refreshTrigger: 0,
      showColorPanel: false, // Start with color panel hidden
      autoHideTimeout: null,
      showGuide: false,
      legendCollapsed: false,
      legendItems: [
        { type: "resolution", name: "Resolution", meaning: "the statement you are examining" },
        { type: "pro", name: "Supporting", meaning: "a reason for the point it is linked to" },
        { type: "con", name: "Opposing", meaning: "a reason against the point it is linked to" },
        { type: "exp", name: "Exploring", meaning: "a point that needs more thought or evidence" },
      ],
      // Buttons shown when the pointer is over a node
      nodeActions: [
        { type: "pro", emoji: "👍", label: "Add a supporting reason" },
        { type: "con", emoji: "👎", label: "Add an opposing reason" },
        { type: "exp", emoji: "✋", label: "Add a point to explore" },
      ],
    };
  },
  computed: {
    pendingDeleteMessage() {
      if (!this.pendingDelete) {
        return '';
      }
      const subPoints = this.pendingDelete.ids.length - 1;
      if (subPoints === 0) {
        return 'Release to remove this point';
      }
      return `Release to remove this point and its ${subPoints} sub-point${subPoints === 1 ? '' : 's'}`;
    },
    // Hint text colour that stays readable on the current canvas colour
    hintColor() {
      const luminance = this.getLuminance(this.canvasColor);
      return luminance !== null && luminance > 0.4
        ? 'rgba(0, 0, 0, 0.6)'
        : 'rgba(255, 255, 255, 0.7)';
    },
  },
  mounted() {
    // Auto-hide functionality
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('keydown', this.handleGuideKeydown);

    // Load saved color scheme if available
    this.loadColorScheme();

    try {
      this.legendCollapsed = localStorage.getItem('legend-collapsed') === 'true';
    } catch (error) {
      // Storage may be blocked; keep the legend open
    }

    // Show the welcome guide on the first visit only
    let guideSeen = false;
    try {
      guideSeen = localStorage.getItem('guide-seen') === 'true';
    } catch (error) {
      // Storage may be blocked; show the guide in that case
    }
    if (!guideSeen) {
      this.openGuide();
    }
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('keydown', this.handleGuideKeydown);
    if (this.autoHideTimeout) {
      clearTimeout(this.autoHideTimeout);
    }
  },
  methods: {
    openGuide() {
      this.showGuide = true;
      this.$nextTick(() => {
        if (this.$refs.guideStartBtn) {
          this.$refs.guideStartBtn.focus();
        }
      });
    },

    closeGuide() {
      this.showGuide = false;
      try {
        localStorage.setItem('guide-seen', 'true');
      } catch (error) {
        console.error('Failed to save guide state:', error);
      }
    },

    toggleLegend() {
      this.legendCollapsed = !this.legendCollapsed;
      try {
        localStorage.setItem('legend-collapsed', String(this.legendCollapsed));
      } catch (error) {
        console.error('Failed to save legend state:', error);
      }
    },

    handleGuideKeydown(event) {
      if (event.key !== 'Escape') {
        return;
      }
      if (this.showPopup) {
        this.closePopup();
      } else if (this.showGuide) {
        this.closeGuide();
      }
    },

    handleMouseMove(event) {
      // Show panel when mouse is close to the left edge
      const triggerZone = 50; // pixels from left edge
      
      if (event.clientX <= triggerZone) {
        // Mouse in trigger zone - show panel
        this.showColorPanel = true;
        // Clear any existing timeout
        if (this.autoHideTimeout) {
          clearTimeout(this.autoHideTimeout);
          this.autoHideTimeout = null;
        }
      } else if (this.showColorPanel && event.clientX > 300) {
        // Mouse moved away from panel - set timeout to hide
        if (!this.autoHideTimeout) {
          this.autoHideTimeout = setTimeout(() => {
            this.showColorPanel = false;
            this.autoHideTimeout = null;
          }, 100); // 100 ms before hiding
        }
      }
    },
    
    toggleColorPanel() {
      this.showColorPanel = !this.showColorPanel;
      // Clear any auto-hide timeout when manually toggling
      if (this.autoHideTimeout) {
        clearTimeout(this.autoHideTimeout);
        this.autoHideTimeout = null;
      }
    },
    
    loadColorScheme() {
      try {
        const savedScheme = localStorage.getItem('color-scheme');
        if (savedScheme) {
          const colorScheme = JSON.parse(savedScheme);
          
          // Apply saved colors
          this.canvasColor = colorScheme.canvas;
          
          // Apply node colors
          for (const type in colorScheme.nodeColors) {
            if (this.nodeColors.hasOwnProperty(type)) {
              this.nodeColors[type] = colorScheme.nodeColors[type];
            }
          }
          
          // Apply text colors
          for (const type in colorScheme.textColors) {
            if (this.textColors.hasOwnProperty(type)) {
              this.textColors[type] = colorScheme.textColors[type];
            }
          }

          // Correct any saved text colour that cannot be read on its node
          for (const type in this.textColors) {
            this.ensureReadableText(type);
          }

          // Update edge colors
          this.updateEdgeColors();
        }
      } catch (error) {
        console.error('Failed to load color scheme:', error);
      }
    },
    
    // Relative luminance of a "#RRGGBB" colour (WCAG 2 formula)
    getLuminance(hex) {
      const value = parseInt(String(hex).replace('#', ''), 16);
      if (Number.isNaN(value)) {
        return null;
      }
      const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(c => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    },

    getContrastRatio(hexA, hexB) {
      const a = this.getLuminance(hexA);
      const b = this.getLuminance(hexB);
      if (a === null || b === null) {
        return null;
      }
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    },

    // If a node's text colour is too close to its background colour,
    // replace it with black or white, whichever is easier to read.
    ensureReadableText(type) {
      const background = this.nodeColors[type];
      const ratio = this.getContrastRatio(background, this.textColors[type]);
      if (ratio !== null && ratio >= 3) {
        return;
      }
      const onBlack = this.getContrastRatio(background, '#000000') || 0;
      const onWhite = this.getContrastRatio(background, '#FFFFFF') || 0;
      this.textColors[type] = onBlack >= onWhite ? '#000000' : '#FFFFFF';
    },

    resetColorScheme() {
      // Reset to default colors
      this.canvasColor = this.defaultColors.canvas;
      
      // Reset node background colors
      for (const type in this.nodeColors) {
        this.nodeColors[type] = this.defaultColors.nodeColors[type];
      }
      
      // Reset text colors
      for (const type in this.textColors) {
        this.textColors[type] = this.defaultColors.textColors[type];
      }
      
      // Update edge colors
      this.updateEdgeColors();
      
      // Automatically save the reset colors
      this.saveColorScheme();
    },
    
    saveColorScheme() {
      // Save all colors to localStorage
      const colorScheme = {
        canvas: this.canvasColor,
        nodeColors: this.nodeColors,
        textColors: this.textColors
      };
      
      try {
        localStorage.setItem('color-scheme', JSON.stringify(colorScheme));
      } catch (error) {
        console.error('Failed to save color scheme:', error);
      }
    },
    
    getNodeTypeLabel(type) {
      switch(type) {
        case 'resolution': return 'Main';
        case 'pro': return 'Supporting';
        case 'con': return 'Opposing';
        case 'exp': return 'Exploring';
        default: return type.charAt(0).toUpperCase() + type.slice(1);
      }
    },
    
    updateEdgeColors() {
      // Update edge colors to match the corresponding child node type
      this.edges.forEach(edge => {
        const targetNode = this.childNodes.find(n => n.id === edge.target);
        if (targetNode) {
          // Edge color should match the child node's type color
          edge.color = this.nodeColors[targetNode.type];
        }
      });
      this.refreshTrigger++;
      
      // Auto-save when colors are updated
      this.saveColorScheme();
    },

    calculatePath(sourceId, targetId) {
      const sourceNode = this.getNodeById(sourceId);
      const targetNode = this.getNodeById(targetId);

      if (!sourceNode || !targetNode) {
        return '';
      }

      // Determine the actual height based on whether emoji menu is showing
      const sourceHeight = sourceNode.showEmojis ? this.nodeWithEmojiHeight : this.nodeBaseHeight;

      // Calculate the anchor points
      const sourceX = sourceNode.position.x + this.nodeWidth / 2;
      const sourceY = sourceNode.position.y + sourceHeight;

      // For target, use the exact top center
      const targetX = targetNode.position.x + this.nodeWidth / 2;
      const targetY = targetNode.position.y; // Top of target node

      // Create a curved path with improved control points
      const distance = Math.abs(targetY - sourceY);
      const controlPointOffset = Math.min(distance * 0.5, 80); // Limit the curve

      return `M${sourceX},${sourceY} C${sourceX},${sourceY + controlPointOffset} ${targetX},${targetY - controlPointOffset} ${targetX},${targetY}`;
    },

    startDrag(event, node) {
      event.preventDefault();
      this.draggingNode = node;

      // Store initial positions
      const startX = event.clientX;
      const startY = event.clientY;
      const nodeStartX = node.position.x;
      const nodeStartY = node.position.y;

      const moveHandler = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        // Update node position
        node.position = {
          x: nodeStartX + dx,
          y: nodeStartY + dy
        };

        this.updatePendingDelete(node);
      };

      const upHandler = () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        
        // A child released over its parent is removed, with its sub-points
        if (this.draggingNode) {
          this.updatePendingDelete(this.draggingNode);
        }
        if (this.pendingDelete) {
          this.deleteChildNode(this.pendingDelete.nodeId);
        }

        this.pendingDelete = null;
        this.draggingNode = null;
      };

      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    },

    // Work out whether releasing the dragged node now would remove it
    updatePendingDelete(node) {
      let pending = null;
      if (node.id !== "resolution") {
        const parentEdge = this.edges.find(e => e.target === node.id);
        const parentNode = parentEdge ? this.getNodeById(parentEdge.source) : null;
        if (parentNode && this.nodesOverlap(node, parentNode)) {
          pending = {
            nodeId: node.id,
            parentId: parentNode.id,
            ids: [node.id, ...this.findAllDescendants(node.id)]
          };
        }
      }
      // Only replace the object when the result changes, to avoid extra renders
      const changed = (pending && pending.parentId) !== (this.pendingDelete && this.pendingDelete.parentId)
        || (pending && pending.nodeId) !== (this.pendingDelete && this.pendingDelete.nodeId);
      if (changed) {
        this.pendingDelete = pending;
      }
    },

    isPendingDelete(id) {
      return !!this.pendingDelete && this.pendingDelete.ids.includes(id);
    },

    nodesOverlap(node1, node2) {
      // Get node1 bounding box
      const node1Left = node1.position.x;
      const node1Top = node1.position.y;
      const node1Right = node1.position.x + this.nodeWidth;
      const node1Bottom = node1.position.y + (node1.showEmojis ? this.nodeWithEmojiHeight : this.nodeBaseHeight);
      
      // Get node2 bounding box
      const node2Left = node2.position.x;
      const node2Top = node2.position.y;
      const node2Right = node2.position.x + this.nodeWidth;
      const node2Bottom = node2.position.y + (node2.showEmojis ? this.nodeWithEmojiHeight : this.nodeBaseHeight);
      
      // Check for overlap
      const horizontalOverlap = node1Left < node2Right && node1Right > node2Left;
      const verticalOverlap = node1Top < node2Bottom && node1Bottom > node2Top;
      
      // If there's both horizontal and vertical overlap, the nodes overlap
      return horizontalOverlap && verticalOverlap;
    },

    deleteChildNode(nodeId) {
      // First find all descendants of this node (children, grandchildren, etc.)
      const descendantIds = this.findAllDescendants(nodeId);
      
      // Add the node itself to the list of nodes to delete
      const nodesToDelete = [nodeId, ...descendantIds];
      
      // Remove all nodes from childNodes array
      this.childNodes = this.childNodes.filter(node => !nodesToDelete.includes(node.id));
      
      // Remove all edges connecting to any of these nodes
      this.edges = this.edges.filter(edge => 
        !nodesToDelete.includes(edge.source) && !nodesToDelete.includes(edge.target)
      );
      
      // Force SVG paths to update
      this.refreshTrigger++;
    },
    
    findAllDescendants(nodeId) {
      // Find immediate children
      const childrenIds = this.edges
        .filter(edge => edge.source === nodeId)
        .map(edge => edge.target);
      
      // Recursively find all descendants
      let allDescendants = [...childrenIds];
      
      for (const childId of childrenIds) {
        const grandchildren = this.findAllDescendants(childId);
        allDescendants = [...allDescendants, ...grandchildren];
      }
      
      return allDescendants;
    },

    getPopupLabel(type) {
      if (this.popupMode === 'edit') {
        return 'Edit text';
      }

      // Get parent node text
      const parentText = this.newNode.parent ? this.newNode.parent.text : '';

      switch(type) {
        case 'pro':
          return `Supporting: "${parentText}"`;
        case 'con':
          return `Opposing: "${parentText}"`;
        case 'exp':
          return `Exploring: "${parentText}"`;
        default:
          return 'Statement';
      }
    },

    openPopup(type, parentNode) {
      this.popupMode = "add";
      this.editingNode = null;
      this.popupError = "";
      this.newNode = {
        type,
        text: "",
        color: this.nodeColors[type],
        parent: parentNode
      };
      this.showPopup = true;
      this.focusPopupInput();
    },

    focusPopupInput(selectText = false) {
      // Focus the textbox after the popup is rendered
      this.$nextTick(() => {
        const input = this.$refs.newNodeInput;
        if (input) {
          input.focus();
          if (selectText) {
            input.select();
          }
        }
      });
    },

    closePopup() {
      // Remove focus from the input before it is removed
      if (this.$refs.newNodeInput) {
        this.$refs.newNodeInput.blur();
      }

      this.showPopup = false;
      this.popupMode = "add";
      this.popupError = "";
      this.editingNode = null;
      // Reset the newNode data
      this.newNode = { type: "", text: "", color: "", parent: null };
    },

    submitPopup() {
      if (this.popupMode === 'edit') {
        this.saveNodeText();
      } else {
        this.addChildNode();
      }
    },

    saveNodeText() {
      const text = this.newNode.text.trim();
      if (!text) {
        this.popupError = "The text cannot be empty.";
        this.focusPopupInput();
        return;
      }
      if (this.editingNode) {
        this.editingNode.text = text;
      }
      this.closePopup();
    },

    addChildNode() {
      if (!this.newNode.text.trim()) {
        this.popupError = "Please write your point before you add it.";
        this.focusPopupInput();
        return;
      }

      // Create an ID for the new node
      const id = `child-${Date.now()}`;

      // Create the new node - positioned relative to the parent
      const newNode = {
        id,
        text: this.newNode.text.trim(),
        type: this.newNode.type,
        position: {
          x: this.newNode.parent.position.x + 50,
          y: this.newNode.parent.position.y + 150
        },
        showEmojis: false
      };

      // Add the node to the collection
      this.childNodes.push(newNode);

      // Create the edge with color matching the child node type
      this.edges.push({
        source: this.newNode.parent.id,
        target: id,
        color: this.nodeColors[this.newNode.type]
      });

      this.closePopup();
    },

    getNodeById(id) {
      if (id === "resolution") {
        return this.resolutionNode;
      }
      return this.childNodes.find(node => node.id === id);
    },

    showEmojiMenu(node) {
      node.showEmojis = true;
      this.refreshTrigger++; // Force SVG paths to update
    },

    hideEmojiMenu(node) {
      node.showEmojis = false;
      this.refreshTrigger++; // Force SVG paths to update
    },

    editNodeText(node) {
      this.popupMode = "edit";
      this.editingNode = node;
      this.popupError = "";
      this.newNode = { type: node.type || "resolution", text: node.text, color: "", parent: null };
      this.showPopup = true;
      this.focusPopupInput(true);
    }
  }
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
}

.canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  overflow: hidden;
  margin: 0;
  transition: background-color 0.3s ease;
}

.node {
  position: absolute;
  width: 150px;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  cursor: grab;
  box-sizing: border-box;
  z-index: 2;
  transition: height 0.2s ease, background-color 0.3s ease, color 0.3s ease;
}

.resolution-node {
  font-weight: bold;
}

.node.dragging {
  cursor: grabbing;
  z-index: 3;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

/* Drag-to-remove feedback */
.node.will-delete {
  opacity: 0.55;
  outline: 2px dashed #ef4444;
  outline-offset: 2px;
}

.node.drop-target {
  outline: 3px solid #ef4444;
  outline-offset: 3px;
  box-shadow: 0 0 0 7px rgba(239, 68, 68, 0.3);
}

.lines path.will-delete {
  opacity: 0.35;
  stroke-dasharray: 6 4;
}

.delete-badge {
  position: absolute;
  margin: 0;
  padding: 4px 10px;
  transform: translateX(-50%);
  border-radius: 4px;
  background-color: #b91c1c;
  color: white;
  font-size: 13px;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  z-index: 4;
}

.emoji-menu {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
}

.emoji-btn {
  position: relative;
  margin: 0;
  padding: 2px 6px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 18px;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.emoji-btn:hover,
.emoji-btn:focus-visible {
  background-color: rgba(0, 0, 0, 0.15);
  transform: scale(1.15);
  outline: none;
}

/* Tooltip that names the action */
.emoji-btn::after {
  content: attr(data-tip);
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #1f2937;
  color: white;
  font-size: 12px;
  font-weight: normal;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 20;
}

.emoji-btn:hover::after,
.emoji-btn:focus-visible::after {
  opacity: 1;
}

.lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  transition: stroke 0.3s ease;
}

.popup-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 150;
}

.popup {
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
  background: white;
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: #1f2937;
  text-align: left;
  font-weight: 600;
}

.popup-error {
  min-height: 1.2em;
  margin: 0;
  color: #b91c1c;
  font-size: 14px;
  font-weight: normal;
}

.popup input[aria-invalid="true"] {
  border-color: #b91c1c;
}

button {
  margin: 5px;
  padding: 5px 10px;
}

input {
  margin: 10px 0;
  padding: 5px;
  width: 100%;
}

/* Color Settings Panel Styles */
.color-settings-panel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: rgba(40, 40, 40, 0.9);
  color: white;
  padding: 10px;
  z-index: 100;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  width: 210px;
  transition: transform 0.3s ease;
  transform: translateX(0);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.color-settings-panel.hidden {
  transform: translateX(-100%);
}

/* Logo styles */
.panel-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  padding: 10px 5px 15px;
  border-bottom: 1px solid #555;
}

/* Company logo */
.company-logo {
  width: 100%;
  max-height: 60px;
  object-fit: contain;
}

/* Version number */
.version-info {
  font-size: 11px;
  color: #999;
  text-align: center;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid #555;
}

.color-picker-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
  overflow-y: auto;
  margin: 5px 0;
}

.color-picker-section {
  margin-top: 5px;
}

.color-picker-section h4 {
  margin: 0 0 5px 0;
  font-size: 13px;
  color: #ccc;
  border-bottom: 1px dotted #555;
  padding-bottom: 3px;
}

.color-picker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.color-picker-item label {
  flex: 1;
  text-align: left;
  margin-right: 5px;
  font-size: 13px;
}

.color-picker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.node-type-label {
  font-size: 13px;
  flex: 1;
}

.color-inputs {
  display: flex;
  gap: 5px;
}

.color-input {
  width: 25px;
  height: 25px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  padding: 0;
}

.reset-btn {
  margin-top: 8px;
  width: 100%;
  background-color: #444;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 12px;
}

.reset-btn:hover {
  background-color: #555;
}

.toggle-panel-btn {
  position: fixed;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  background-color: rgba(60, 60, 60, 0.7);
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  width: 20px;
  height: 60px;
  padding: 0;
  cursor: pointer;
  z-index: 99;
  transition: left 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-panel-btn.panel-open {
  left: 210px;
}



/* Additional styles for popup buttons */
.popup-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

.popup-btn {
  padding: 12px 24px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 80px;
}

.confirm-btn {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}

.confirm-btn:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
  transform: translateY(-1px);
}

.cancel-btn {
  background-color: #6b7280;
  color: white;
  border-color: #6b7280;
}

.cancel-btn:hover {
  background-color: #4b5563;
  border-color: #4b5563;
  transform: translateY(-1px);
}

/* Ensure popup input styling */
.popup input {
  margin: 15px 0 10px 0;
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.popup input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Help button */
.help-btn {
  position: fixed;
  top: 12px;
  right: 12px;
  margin: 0;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: rgba(60, 60, 60, 0.8);
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  z-index: 99;
  transition: background-color 0.2s;
}

.help-btn:hover,
.help-btn:focus-visible {
  background-color: #2563eb;
}

/* First-step hint */
.empty-hint {
  position: absolute;
  width: 260px;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  pointer-events: none;
  user-select: none;
  z-index: 1;
}

/* Legend */
.legend {
  position: fixed;
  right: 12px;
  bottom: 12px;
  max-width: calc(100vw - 24px);
  width: 290px;
  box-sizing: border-box;
  padding: 8px 12px 10px;
  border-radius: 8px;
  background-color: rgba(40, 40, 40, 0.9);
  color: white;
  font-size: 13px;
  text-align: left;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 98;
}

.legend.collapsed {
  width: auto;
  padding: 4px 8px;
}

.legend-toggle {
  margin: 0;
  padding: 2px 0;
  border: none;
  background: none;
  color: #ccc;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
}

.legend-toggle:hover,
.legend-toggle:focus-visible {
  color: white;
}

.legend ul {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
}

.legend li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.legend-swatch {
  flex: none;
  width: 14px;
  height: 14px;
  margin-top: 2px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* Welcome guide */
.guide-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 200;
}

.guide {
  background: white;
  color: #1f2937;
  max-width: 520px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px 28px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: left;
  line-height: 1.5;
  box-sizing: border-box;
}

.guide h2 {
  margin: 0 0 8px;
  font-size: 22px;
}

.guide h3 {
  margin: 18px 0 6px;
  font-size: 16px;
}

.guide ul,
.guide ol {
  margin: 0;
  padding-left: 22px;
}

.guide li {
  margin-bottom: 4px;
}

.guide-intro {
  margin: 0;
}

.guide-note {
  margin: 16px 0;
  font-size: 14px;
  color: #6b7280;
}

.guide .confirm-btn {
  display: block;
  margin: 0 auto;
}


</style>