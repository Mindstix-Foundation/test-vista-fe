<template>
  <div class="form-floating dropdown" ref="dropdownRef">
    <input
      type="text"
      class="form-control"
      :class="$attrs.class"
      :id="id"
      :placeholder="isSearchEnabled ? placeholder : 'Click to select'"
      v-model="searchText"
      @input="handleInput"
      @focus="handleClick"
      @click="handleClick"
      @blur="handleBlur"
      autocomplete="new-password"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      :name="`no-autofill-${Date.now()}-${id}`"
      :data-form-type="'other'"
      :data-lpignore="true"
      aria-autocomplete="none"
      data-ms-editor="false"
      data-address-field="no"
      data-1p-ignore="true"
      data-bwignore="true"
      data-dashlane-ignore="true"
      role="combobox"
      aria-expanded="false"
      :aria-expanded="showDropdown ? 'true' : 'false'"
      aria-haspopup="listbox"
      aria-controls="combobox-listbox"
      :aria-controls="listboxId"
      :readonly="!isSearchEnabled"
      :onfocus="isSearchEnabled ? 'this.removeAttribute(\'readonly\')' : undefined"
      required
      :disabled="disabled"
      @keydown="handleKeydown"
    />
    <div
      class="dropdown-menu"
      :class="{ show: showDropdown }"
      style="position: absolute; width: 100%; z-index: 1000"
      :id="listboxId"
    >
      <!-- Show loading while parent fetches options -->
      <div v-if="loading" class="dropdown-item no-data-item">
        Loading…
      </div>
      <!-- Show "No data available" message when there are no items -->
      <div v-else-if="processedItems.length === 0" class="dropdown-item no-data-item">
        No data available
      </div>
      <!-- Show "No results found" when there are items but none match the search -->
      <div v-else-if="filteredItems.length === 0" class="dropdown-item no-data-item">
        No results found
      </div>
      <!-- Show filtered items when available -->
      <button
        v-else
        v-for="(item, index) in filteredItems"
        :key="getItemKey(item)"
        class="dropdown-item"
        :class="{ active: index === selectedIndex }"
        @click="selectItem(item)"
        @mousedown.prevent
        type="button"
      >
        <slot name="item" :item="item">
          {{ getItemLabel(item) }}
        </slot>
      </button>
    </div>
    <label :for="id">{{ label }} <span v-if="required" class="text-danger">*</span></label>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

export interface Item {
  id?: number | string
  value?: number | string
  key?: number | string
  code?: string
  name?: string
  label?: string
  title?: string
  text?: string
  abbreviation?: string
  [key: string]: unknown
}

interface Props {
  id: string
  label: string
  placeholder: string
  items: Item[] | { data: Item[], meta?: Record<string, unknown> }
  modelValue: Item | null
  disabled?: boolean
  required?: boolean
  labelKey?: string
  valueKey?: string
  searchKeys?: string[]
  itemKey?: string
  nextFieldId?: string
  dataPath?: string
  /** When true, show Loading… instead of No data available */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  labelKey: 'name',
  valueKey: 'id',
  searchKeys: () => ['name', 'abbreviation'],
  itemKey: 'id',
  nextFieldId: undefined,
  dataPath: '',
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Item | null): void
  (e: 'change', value: Item | null): void
}>()

const searchText = ref('')
const showDropdown = ref(false)
const selectedIndex = ref(-1)
const dropdownRef = ref<HTMLElement | null>(null)
const listboxId = computed(() => `${props.id}-listbox`)

const getNestedValue = (obj: Record<string, unknown> | null | undefined, path: string): unknown => {
  if (!obj) return undefined

  let current: unknown = obj
  const keys = path.split('.')

  for (const key of keys) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }

  return current
}

const getItemLabel = (item: Item): string => {
  if (!item) return ''

  // Try to get the value using the configured labelKey
  const value = getNestedValue(item, props.labelKey)
  if (value !== undefined) return String(value)

  // Fallbacks for different data formats
  if (item.name !== undefined) return String(item.name)
  if (item.label !== undefined) return String(item.label)
  if (item.title !== undefined) return String(item.title)
  if (item.text !== undefined) return String(item.text)

  // Last resort: return the item's ID or value as a string
  if (item.id !== undefined) return String(item.id)
  if (item.value !== undefined) return String(item.value)
  if (item.key !== undefined) return String(item.key)
  if (item.code !== undefined) return String(item.code)

  return String(item) || ''
}

const getItemKey = (item: Item): string | number => {
  // Try to get the key using the configured itemKey
  const value = getNestedValue(item, props.itemKey)
  if (value !== undefined && (typeof value === 'string' || typeof value === 'number')) {
    return value
  }

  // Fallbacks for different data formats
  if (item.id !== undefined) return item.id
  if (item.value !== undefined) return item.value
  if (item.key !== undefined) return item.key
  if (item.code !== undefined) return item.code

  // Last resort: stringify the item
  return JSON.stringify(item)
}

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      searchText.value = getItemLabel(newValue)
    } else if (!showDropdown.value) {
      // Keep typed search text while the user is filtering (handleInput emits null)
      searchText.value = ''
    }
  },
  { immediate: true },
)

// Process items to handle nested data structures
const processedItems = computed(() => {
  // If items is an array, return it directly
  if (Array.isArray(props.items)) {
    return props.items
  }

  // If items has a data property that's an array, return that
  if (props.items && typeof props.items === 'object' && 'data' in props.items && Array.isArray(props.items.data)) {
    return props.items.data
  }

  // If a specific dataPath is provided, try to access that path
  if (props.dataPath && props.items && typeof props.items === 'object') {
    const value = getNestedValue(props.items as Record<string, unknown>, props.dataPath)
    if (Array.isArray(value)) {
      return value as Item[]
    }
  }

  // Fallback to empty array if we can't find valid items
  return [] as Item[]
})

// Computed property to determine if search should be enabled
const isSearchEnabled = computed(() => {
  return processedItems.value.length >= 5
})

const filteredItems = computed(() => {
  // If search is disabled, return all items
  if (!isSearchEnabled.value) {
    return processedItems.value
  }

  const search = searchText.value.toLowerCase()
  if (!search) return processedItems.value

  return processedItems.value.filter((item) => {
    // First try the configured search keys
    const matchesSearchKeys = props.searchKeys.some((key) => {
      const value = getNestedValue(item, key)
      return value !== undefined && String(value).toLowerCase().includes(search)
    })

    if (matchesSearchKeys) return true

    // Fallback to checking common properties if no match found
    const commonKeys = ['name', 'label', 'title', 'text', 'description', 'abbreviation']
    return commonKeys.some(key => {
      const value = getNestedValue(item, key)
      return value !== undefined && String(value).toLowerCase().includes(search)
    })
  })
})

const handleInput = () => {
  // If search is disabled, don't perform search operations
  if (!isSearchEnabled.value) {
    return
  }

  showDropdown.value = true
  selectedIndex.value = -1
  emit('update:modelValue', null)
  
  // Update aria-expanded attribute
  nextTick(() => {
    const input = dropdownRef.value?.querySelector('input')
    if (input) {
      input.setAttribute('aria-expanded', 'true')
    }
    
    // Reset scroll position when filtering
    const dropdownMenu = dropdownRef.value?.querySelector('.dropdown-menu')
    if (dropdownMenu) {
      dropdownMenu.scrollTop = 0
    }
  })
}

const openDropdownAtIndex = (index: number) => {
  showDropdown.value = true
  selectedIndex.value = index
}

const handleArrowDown = () => {
  if (showDropdown.value) {
    selectedIndex.value = Math.min(selectedIndex.value + 1, filteredItems.value.length - 1)
  } else {
    openDropdownAtIndex(filteredItems.value.length > 0 ? 0 : -1)
  }
  scrollToSelectedItem()
}

const handleArrowUp = () => {
  if (showDropdown.value) {
    selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
  } else {
    openDropdownAtIndex(
      filteredItems.value.length > 0 ? filteredItems.value.length - 1 : -1,
    )
  }
  scrollToSelectedItem()
}

const handleEnterKey = () => {
  if (!showDropdown.value) {
    showDropdown.value = true
    if (filteredItems.value.length > 0) {
      selectedIndex.value = 0
    }
    return
  }

  if (selectedIndex.value >= 0 && filteredItems.value[selectedIndex.value]) {
    selectItem(filteredItems.value[selectedIndex.value])
  } else if (filteredItems.value.length > 0) {
    selectItem(filteredItems.value[0])
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // Always prevent default for arrow keys and enter to avoid browser interference
  if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (!showDropdown.value && event.key !== 'Enter') return

  switch (event.key) {
    case 'ArrowDown':
      handleArrowDown()
      break
    case 'ArrowUp':
      handleArrowUp()
      break
    case 'Enter':
      handleEnterKey()
      break
    case 'Escape':
      showDropdown.value = false
      selectedIndex.value = -1
      break
  }
}

// Function to scroll the selected item into view
const scrollToSelectedItem = () => {
  nextTick(() => {
    // Add a small delay to ensure DOM is fully updated
    setTimeout(() => {
      if (selectedIndex.value >= 0 && dropdownRef.value) {
        const dropdownMenu = dropdownRef.value.querySelector('.dropdown-menu')
        
        if (dropdownMenu) {
          // Get all dropdown items (buttons only, not the no-data divs)
          const dropdownItems = dropdownMenu.querySelectorAll('button.dropdown-item')
          const selectedItem = dropdownItems[selectedIndex.value] as HTMLElement
          
          if (selectedItem) {
            // Calculate if we need to scroll
            const itemHeight = selectedItem.offsetHeight
            const menuScrollTop = dropdownMenu.scrollTop
            const menuHeight = dropdownMenu.clientHeight
            const itemOffsetTop = selectedItem.offsetTop
            
            // Check if item is below visible area
            if (itemOffsetTop + itemHeight > menuScrollTop + menuHeight) {
              dropdownMenu.scrollTop = itemOffsetTop + itemHeight - menuHeight
            }
            // Check if item is above visible area
            else if (itemOffsetTop < menuScrollTop) {
              dropdownMenu.scrollTop = itemOffsetTop
            }
          }
        }
      }
    }, 10) // Small delay to ensure DOM is updated
  })
}

const selectItem = (item: Item) => {
  emit('update:modelValue', item)
  emit('change', item)
  searchText.value = getItemLabel(item)
  showDropdown.value = false
  selectedIndex.value = -1

  // Update aria-expanded attribute
  nextTick(() => {
    const input = dropdownRef.value?.querySelector('input')
    if (input) {
      input.setAttribute('aria-expanded', 'false')
    }
  })

  // Move focus to next field
  nextTick(() => {
    if (props.nextFieldId) {
      // If nextFieldId is specified, try to focus that element
      const nextElement = document.getElementById(props.nextFieldId)
      if (nextElement && !nextElement.hasAttribute('disabled')) {
        nextElement.focus()
        // Trigger click to open dropdown if it's our searchable dropdown
        if (nextElement.classList.contains('form-control')) {
          nextElement.click()
        }
      }
    } else {
      // Fall back to default tab order behavior
      const currentInput = document.getElementById(props.id)
      if (currentInput) {
        const allFocusable = Array.from(
          document.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        )
        const currentIndex = allFocusable.indexOf(currentInput)
        if (currentIndex > -1 && currentIndex < allFocusable.length - 1) {
          const nextElement = allFocusable[currentIndex + 1] as HTMLElement
          nextElement.focus()
        }
      }
    }
  })
}

// Add click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    // Only close if click is outside the dropdown and not on the input
    const input = dropdownRef.value.querySelector('input')
    if (input !== target) {
      showDropdown.value = false
      selectedIndex.value = -1
      // Update aria-expanded attribute
      input?.setAttribute('aria-expanded', 'false')
    }
  }
}

// Add blur handler
const handleBlur = (event: FocusEvent) => {
  // Use setTimeout to allow click events on dropdown items to fire first
  setTimeout(() => {
    const relatedTarget = event.relatedTarget as HTMLElement
    if (!dropdownRef.value?.contains(relatedTarget)) {
      showDropdown.value = false
      selectedIndex.value = -1
      // Update aria-expanded attribute
      const input = dropdownRef.value?.querySelector('input')
      input?.setAttribute('aria-expanded', 'false')
    }
  }, 200)
}

// Add lifecycle hooks for event listener
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)

  // Clear any browser autofill data
  clearAutofillData()
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// Function to clear browser autofill data
const clearAutofillData = () => {
  // For some browsers, we need to set a random value and then clear it
  // to prevent autofill from working
  if (dropdownRef.value) {
    const input = dropdownRef.value.querySelector('input')
    if (input) {
      // Set a temporary random value
      const originalValue = input.value
      input.value = `no-autofill-${crypto.randomUUID()}`

      // Then restore the original value
      setTimeout(() => {
        input.value = originalValue
        
        // Additional measures to prevent autofill
        input.setAttribute('autocomplete', 'new-password')
        input.dataset.formType = 'other'
        input.dataset.lpignore = 'true'
        input.dataset['1pIgnore'] = 'true'
        input.dataset.bwignore = 'true'
        input.dataset.dashlaneIgnore = 'true'
        input.setAttribute('aria-autocomplete', 'none')
        
        // Disable browser address suggestions
        input.dataset.addressField = 'no'
        input.dataset.msEditor = 'false'
      }, 1)
    }
  }
}

// Expose method to clear selection
defineExpose({
  clear: () => {
    searchText.value = ''
    emit('update:modelValue', null)
    selectedIndex.value = -1
  },
})

// Add a new method to handle click events
const handleClick = () => {
  // Show dropdown and update selectedIndex to first item if input is empty and there are items
  showDropdown.value = true
  
  // When search is disabled or input is empty, pre-select the first item
  if ((!isSearchEnabled.value || !searchText.value.trim()) && filteredItems.value.length > 0) {
    selectedIndex.value = 0 // Pre-select the first item
    scrollToSelectedItem() // Ensure first item is visible
  }
  
  // Update aria-expanded attribute
  nextTick(() => {
    const input = dropdownRef.value?.querySelector('input')
    if (input) {
      input.setAttribute('aria-expanded', showDropdown.value.toString())
    }
  })
}
</script>

<style scoped>
.dropdown-menu {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #6c757d transparent;
}

/* Custom scrollbar for webkit browsers */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background-color: #6c757d;
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background-color: #495057;
}

.dropdown-item {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  display: block;
  color: #212529;
}

.no-data-item {
  color: #6c757d;
  font-style: italic;
  cursor: default;
}

.no-data-item:hover {
  background-color: transparent;
  color: #6c757d;
}

.dropdown-item:hover,
.dropdown-item.active {
  background-color: #212529;
  color: #fff;
}

.form-floating > .form-control {
  height: calc(3.5rem + 2px);
  line-height: 1.25;
}

.form-floating > label {
  padding: 1rem 0.75rem;
}

/* Prevent browser autofill styling */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
  -webkit-text-fill-color: #212529 !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* Prevent browser address suggestions */
input[data-address-field="no"] {
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
}

/* Disable browser autofill dropdown */
input::-webkit-contacts-auto-fill-button,
input::-webkit-credentials-auto-fill-button {
  visibility: hidden;
  display: none !important;
  pointer-events: none;
  height: 0;
  width: 0;
  margin: 0;
}

/* Ensure our dropdown appears above browser suggestions */
.dropdown-menu.show {
  z-index: 9999 !important;
}

/* Add validation styling */
:deep(.form-control.is-valid) {
  border-color: #198754;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

:deep(.form-control.is-valid:focus) {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}
</style>
