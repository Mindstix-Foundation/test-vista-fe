<template>
  <fieldset class="border p-2 rounded col col-12 col-sm-10 col-md-8 mb-2">
    <legend class="float-none w-auto">
      {{ title }} <span v-if="required" class="text-danger">*</span>
    </legend>
    <div class="row g-2">
      <div v-for="(item, index) in items" :key="index" class="col-12" 
           :class="{ 'item-container': true, 'draggable': draggable && !(isLastEmptyField(index)) }"
           :draggable="draggable && !(isLastEmptyField(index))"
           @dragstart="draggable && !(isLastEmptyField(index)) ? dragStart($event, index) : null"
           @dragover.prevent
           @dragenter.prevent="draggable && !(isLastEmptyField(index)) ? dragEnter($event, index) : null"
           @dragleave.prevent
           @drop="draggable && !(isLastEmptyField(index)) ? drop($event, index) : null"
           @dragend="draggable && !(isLastEmptyField(index)) ? dragEnd() : null">
        <div :class="{ 'd-flex': draggable, 'align-items-center': draggable }">
          <div v-if="draggable && !(isLastEmptyField(index))" class="drag-handle me-2" title="Drag to reorder">
            <i class="bi bi-grip-vertical"></i>
          </div>
          <div v-else-if="draggable" class="me-4">
            <!-- Spacer to maintain alignment when no drag handle is shown -->
          </div>
          <div class="form-floating flex-grow-1">
            <input
              type="text"
              class="form-control"
              :class="{
                'is-valid':
                  item.name.trim().length > 0 && !isDuplicate(item.name, index),
                'is-invalid':
                  (!validationState.valid && validationState.touched) ||
                  (item.name.trim().length > 0 && isDuplicate(item.name, index)),
              }"
              :id="getInputId(index)"
              v-model="item.name"
              @keydown="(e) => handleKeyDown(index, e)"
              @focus="focusedIndex = index"
              @blur="handleBlur(index)"
              @input="
                (e) => {
                  item.name = formatValue ? formatValue((e.target as HTMLInputElement).value) : (e.target as HTMLInputElement).value
                  handleInput(index)
                  emit('update:validationState', { ...validationState, touched: true })
                }
              "
              :placeholder="placeholder"
            />
            <label :for="getInputId(index)">{{ itemLabelPrefix }} {{ index + 1 }}</label>
            <div class="invalid-feedback">
              {{
                isDuplicate(item.name, index)
                  ? `This ${itemLabelPrefix.toLowerCase()} ${VALIDATION_MESSAGES.LIST.DUPLICATE}`
                  : `At least one ${itemLabelPrefix.toLowerCase()} ${VALIDATION_MESSAGES.LIST.AT_LEAST_ONE_REQUIRED}`
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { VALIDATION_MESSAGES } from '@/utils/validationConstants'

// Define the item interface
interface ListItem {
  id?: number
  name: string
  board_id?: number
  sequence_number?: number
  [key: string]: unknown // Use unknown instead of any for additional properties
}

// Props
const props = withDefaults(
  defineProps<{
    title: string
    modelValue: ListItem[]
    validationState: { valid: boolean; touched: boolean }
    itemLabelPrefix?: string
    placeholder?: string
    required?: boolean
    draggable?: boolean
    formatValue?: (value: string) => string
    baseId: string
  }>(),
  {
    itemLabelPrefix: 'Item',
    placeholder: 'Enter item name',
    required: true,
    draggable: false,
  },
)

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: ListItem[]): void
  (e: 'update:validationState', value: { valid: boolean; touched: boolean }): void
}>()

// State
const focusedIndex = ref(-1)
const draggedItemIndex = ref<number | null>(null)
const dragOverItemIndex = ref<number | null>(null)

// Auto-scroll state
const autoScrollInterval = ref<number | null>(null)
const isDragging = ref(false)

// Computed
const items = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
  },
})

// Auto-scroll functionality
const startAutoScroll = (direction: 'up' | 'down', speed: number = 5) => {
  if (autoScrollInterval.value) return // Already scrolling
  
  // Add visual indicator class to body
  document.body.classList.add(`auto-scrolling-${direction}`)
  
  autoScrollInterval.value = globalThis.setInterval(() => {
    if (!isDragging.value) {
      stopAutoScroll()
      return
    }
    
    const scrollAmount = direction === 'up' ? -speed : speed
    globalThis.scrollBy(0, scrollAmount)
  }, 16) // ~60fps
}

const stopAutoScroll = () => {
  if (autoScrollInterval.value) {
    clearInterval(autoScrollInterval.value)
    autoScrollInterval.value = null
  }
  
  // Remove visual indicator classes from body
  document.body.classList.remove('auto-scrolling-up', 'auto-scrolling-down')
}

const handleDragOverForAutoScroll = (event: DragEvent) => {
  if (!isDragging.value) return
  
  const viewportHeight = globalThis.innerHeight
  const mouseY = event.clientY
  const scrollThreshold = 100 // pixels from edge to start scrolling
  const maxSpeed = 15
  
  // Calculate distance from edges
  const distanceFromTop = mouseY
  const distanceFromBottom = viewportHeight - mouseY
  
  // Stop any existing auto-scroll
  stopAutoScroll()
  
  // Check if we should scroll up
  if (distanceFromTop < scrollThreshold && globalThis.scrollY > 0) {
    const speed = Math.max(3, maxSpeed * (1 - distanceFromTop / scrollThreshold))
    startAutoScroll('up', speed)
  }
  // Check if we should scroll down
  else if (distanceFromBottom < scrollThreshold) {
    const speed = Math.max(3, maxSpeed * (1 - distanceFromBottom / scrollThreshold))
    startAutoScroll('down', speed)
  }
}

// Add global drag over listener for auto-scroll
onMounted(() => {
  if (props.draggable) {
    document.addEventListener('dragover', handleDragOverForAutoScroll)
  }
})

onUnmounted(() => {
  if (props.draggable) {
    document.removeEventListener('dragover', handleDragOverForAutoScroll)
    stopAutoScroll()
  }
})

// Check if an index refers to the last empty field
const isLastEmptyField = (index: number): boolean => {
  return index === items.value.length - 1 && items.value[index].name.trim() === '';
}

// Methods
const isDuplicate = (name: string, currentIndex: number): boolean => {
  const trimmedName = name.trim().toLowerCase()
  return items.value.some(
    (item, index) => index !== currentIndex && item.name.trim().toLowerCase() === trimmedName,
  )
}

const handleInput = (index: number) => {
  const currentItem = items.value[index]

  // Add new field if the last field is filled
  if (index === items.value.length - 1 && currentItem.name.trim() !== '') {
    const newItem: ListItem = { name: '' }
    
    // Copy board_id if it exists
    if (currentItem.board_id) {
      newItem.board_id = currentItem.board_id
    }
    
    // Add sequence number if draggable
    if (props.draggable) {
      newItem.sequence_number = items.value.length + 1
    }
    
    items.value.push(newItem)
  }

  // Update validation state
  const updatedValidation = {
    ...props.validationState,
    valid: items.value.some((item) => item.name.trim() !== ''),
    touched: true,
  }
  emit('update:validationState', updatedValidation)
}

const handleBlur = (index: number) => {
  focusedIndex.value = -1
  const currentItem = items.value[index]
  
  // Remove empty field if it's not the last one
  if (
    !currentItem.name.trim() &&
    items.value.length > 1 &&
    index !== items.value.length - 1
  ) {
    items.value.splice(index, 1)
    
    // Update sequence numbers if draggable
    if (props.draggable) {
      updateSequenceNumbers()
    }
  }
}

const handleKeyDown = (index: number, event: KeyboardEvent) => {
  const currentItem = items.value[index]

  if (event.key === 'Enter') {
    handleEnterKey(index, currentItem, event)
  } else if (event.key === 'Backspace' && currentItem.name === '') {
    handleBackspaceKey(index, event)
  }
}

// Handle Enter key press
const handleEnterKey = (index: number, currentItem: ListItem, event: KeyboardEvent) => {
  event.preventDefault() // Always prevent form submission
  
  // If this is the last field and it's empty, move to the next form section
  if (!currentItem.name.trim() && index === items.value.length - 1) {
    // Find next focusable element in the form
    const allFocusable = Array.from(
      document.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    )
    
    // Get current input
    const currentInput = document.getElementById(getInputId(index))
    if (currentInput) {
      const currentIndex = allFocusable.indexOf(currentInput)
      // Find the next input outside this component
      if (currentIndex > -1 && currentIndex < allFocusable.length - 1) {
        const nextElement = allFocusable[currentIndex + 1]
        nextElement.focus()
        
        // If it's a dropdown, trigger click to show options
        if (nextElement.classList.contains('form-control')) {
          nextElement.click()
        }
      }
    }
    return
  }
  
  // If there's a next field in this list, focus it
  if (index < items.value.length - 1) {
    focusInput(index + 1)
    return
  }
  
  // If we're at the last field with content, add a new field and focus it
  if (currentItem.name.trim() && index === items.value.length - 1) {
    // This will be handled by handleInput, just focus the new field
    setTimeout(() => {
      focusInput(items.value.length - 1)
    }, 10)
  }
}

// Handle Backspace key press on empty field
const handleBackspaceKey = (index: number, event: KeyboardEvent) => {
  // Only handle if not the last empty field and we have more than one item
  const isNotLastItem = index !== items.value.length - 1
  const hasMultipleItems = items.value.length > 1
  
  if (!hasMultipleItems || !isNotLastItem) return
  
  event.preventDefault()
  
  // Remove the item
  items.value.splice(index, 1)
  
  // Update sequence numbers if draggable
  updateSequenceNumbers()
  
  // Focus previous input
  focusInput(index - 1)
}

// Focus an input by index
const focusInput = (index: number) => {
  const input = document.getElementById(getInputId(index))
  if (input) input.focus()
}

// Update sequence numbers if draggable
const updateSequenceNumbers = () => {
  if (props.draggable) {
    for (const [idx, item] of items.value.entries()) {
      item.sequence_number = idx + 1
    }
  }
}

const getInputId = (index: number) => {
  return `${props.baseId}${index}`
}

// Drag and drop functionality
const dragStart = (event: DragEvent, index: number) => {
  if (props.draggable && event.dataTransfer && !isLastEmptyField(index)) {
    isDragging.value = true
    draggedItemIndex.value = index
    event.dataTransfer.effectAllowed = 'move'
    
    // Store the dragged item element reference for ghost image
    const target = event.target as HTMLElement
    const itemContainer = target.closest('.item-container') as HTMLElement
    
    // Create a ghost image for better visual feedback
    if (event.dataTransfer && itemContainer) {
      // Set a semi-transparent ghost image
      const rect = itemContainer.getBoundingClientRect()
      const ghostElement = itemContainer.cloneNode(true) as HTMLElement
      ghostElement.style.width = `${rect.width}px`
      ghostElement.style.opacity = '0.5'
      ghostElement.style.position = 'absolute'
      ghostElement.style.top = '-1000px'
      document.body.appendChild(ghostElement)
      
      // Set the ghost image with offset
      event.dataTransfer.setDragImage(ghostElement, 20, 20)
      
      // Remove the ghost element after a delay
      setTimeout(() => {
        ghostElement.remove()
      }, 0)
    }
    
    // Mark the dragged item
    setTimeout(() => {
      if (itemContainer) {
        itemContainer.classList.add('dragging')
        
        // Add a visual indicator to all other items
        for (const el of document.querySelectorAll('.item-container')) {
          if (el !== itemContainer) {
            el.classList.add('item-not-dragged')
          }
        }
      }
    }, 0)
  }
}

// Clear drag-over state from all item containers
const clearDragOverState = () => {
  for (const item of document.querySelectorAll('.item-container')) {
    item.classList.remove('drag-over')
  }
}

// Handle item shifting animation between source and target
const updateItemShiftingClasses = (start: number, end: number, sourceIndex: number) => {
  const containers = document.querySelectorAll('.item-container')
  for (const [idx, container] of containers.entries()) {
    const shouldShift = idx >= start && 
                        idx <= end && 
                        idx !== sourceIndex && 
                        !isLastEmptyField(idx)
    
    container.classList.toggle('item-shifting', shouldShift)
  }
}

const dragEnter = (event: DragEvent, index: number) => {
  // Early return if conditions aren't met
  if (!props.draggable || isLastEmptyField(index) || dragOverItemIndex.value === index) {
    return
  }

  // Update drag-over state
  clearDragOverState()
  dragOverItemIndex.value = index
  
  const target = event.target as HTMLElement
  const itemContainer = target.closest('.item-container')
  if (!itemContainer) return
  
  // Highlight the target position
  itemContainer.classList.add('drag-over')
  
  // Handle shifting animation only if we have a valid source
  if (draggedItemIndex.value !== null) {
    const start = Math.min(draggedItemIndex.value, index)
    const end = Math.max(draggedItemIndex.value, index)
    updateItemShiftingClasses(start, end, draggedItemIndex.value)
  }
}

const dragEnd = () => {
  if (props.draggable) {
    isDragging.value = false
    stopAutoScroll()
    
    // Reset all classes and states
    const itemContainers = document.querySelectorAll('.item-container')
    for (const item of itemContainers) {
      item.classList.remove('dragging', 'drag-over', 'item-not-dragged', 'item-shifting')
    }
    draggedItemIndex.value = null
    dragOverItemIndex.value = null
  }
}

const drop = (event: DragEvent, dropIndex: number) => {
  if (!props.draggable) return
  
  event.preventDefault()

  if (draggedItemIndex.value === null || draggedItemIndex.value === dropIndex || isLastEmptyField(dropIndex)) {
    return
  }

  // Get the dragged item
  const draggedItem = { ...items.value[draggedItemIndex.value] }

  // Remove the dragged item from its original position
  items.value.splice(draggedItemIndex.value, 1)

  // Insert the dragged item at the new position
  items.value.splice(dropIndex, 0, draggedItem)

  // Update sequence numbers for all items
  if (props.draggable) {
    updateSequenceNumbers()
  }

  // Clear drag state
  dragEnd()
}

// Watch for validation changes
watch(
  () => items.value.filter(item => item.name.trim()).length,
  (count) => {
    // Update validation state
    const updatedValidation = {
      ...props.validationState,
      valid: count > 0,
      touched: props.validationState.touched,
    }
    emit('update:validationState', updatedValidation)
  }
)
</script>

<style scoped>
/* Drag and drop styles */
.item-container {
  position: relative;
  transition: all 0.2s ease;
  border-radius: 0.25rem;
  padding: 0.25rem;
  margin-bottom: 0.5rem;
  border: 1px solid transparent;
}

.draggable {
  cursor: grab;
}

.item-container.dragging {
  opacity: 0.5;
  cursor: grabbing;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  z-index: 10;
  border: 1px dashed #0d6efd;
  background-color: rgba(13, 110, 253, 0.02);
}

.item-container.drag-over {
  background-color: rgba(13, 110, 253, 0.08);
  transform: translateY(2px);
  border: 1px dashed #0d6efd;
  position: relative;
}

/* Show a line above the target to indicate insertion point */
.item-container.drag-over::before {
  content: '';
  position: absolute;
  top: -3px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #0d6efd;
  border-radius: 1px;
}

/* Style for items that are not being dragged but affected */
.item-container.item-not-dragged {
  opacity: 0.7;
}

/* Animation for items that need to shift */
.item-container.item-shifting {
  background-color: rgba(13, 110, 253, 0.05);
  transform: translateY(1px);
}

/* Hide drag handle for the last empty field */
.drag-handle {
  cursor: grab;
  color: #666;
  font-size: 0.9rem;
  user-select: none;
}

.drag-handle:hover {
  color: #0d6efd;
}

/* Add animation transition for all items during drag */
.row > .col-12 {
  transition: transform 0.15s ease-out, opacity 0.15s ease;
}

/* Auto-scroll indicators */
body.auto-scrolling-up::before,
body.auto-scrolling-down::after {
  content: '';
  position: fixed;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to bottom, rgba(13, 110, 253, 0.1), transparent);
  z-index: 9999;
  pointer-events: none;
}

body.auto-scrolling-up::before {
  top: 0;
}

body.auto-scrolling-down::after {
  bottom: 0;
  background: linear-gradient(to top, rgba(13, 110, 253, 0.1), transparent);
}

/* Smooth scrolling for the entire page during drag */
html {
  scroll-behavior: smooth;
}

/* Disable text selection during drag */
.item-container.dragging * {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

@keyframes slideInFromTop {
  0% {
    transform: translateY(-5px);
    opacity: 0.7;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style> 