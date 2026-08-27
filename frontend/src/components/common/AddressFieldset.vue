<template>
  <fieldset class="border p-3 rounded col-12 col-sm-10 col-md-8" 
    autocomplete="off" 
    data-form-type="other" 
    data-address-type="none"
  >
    <legend class="float-none w-auto px-2">{{ title }} Address &nbsp;</legend>
    <div class="row g-3">
      <!-- Country -->
      <div class="col-12 col-xl-4">
        <SearchableDropdown
          :id="'country'"
          label="Country"
          placeholder="Search Country"
          :items="countries"
          v-model="selectedCountry"
          :required="true"
          :class="{
            'is-invalid': !validationStates.country.valid && validationStates.country.touched,
            'is-valid': validationStates.country.valid,
          }"
          nextFieldId="state"
          @change="handleCountryChange"
        />
        <div class="invalid-feedback">Please select a country</div>
      </div>

      <!-- State -->
      <div class="col-12 col-xl-4">
        <SearchableDropdown
          :id="'state'"
          label="State"
          placeholder="Search State"
          :items="states"
          v-model="selectedState"
          :required="true"
          :disabled="!address.country_id"
          :loading="loadingStates"
          :class="{
            'is-invalid': !validationStates.state.valid && validationStates.state.touched,
            'is-valid': validationStates.state.valid,
          }"
          nextFieldId="city"
          @change="handleStateChange"
        />
        <div class="invalid-feedback">Please select a state</div>
      </div>

      <!-- City -->
      <div class="col-12 col-xl-4">
        <SearchableDropdown
          :id="'city'"
          label="City"
          placeholder="Search City"
          :items="cities"
          v-model="selectedCity"
          :required="true"
          :disabled="!address.state_id"
          :class="{
            'is-invalid': !validationStates.city.valid && validationStates.city.touched,
            'is-valid': validationStates.city.valid,
          }"
          nextFieldId="address"
          @change="handleCityChange"
        />
        <div class="invalid-feedback">Please select a city</div>
      </div>

      <!-- Street Address -->
      <div class="col-12">
        <div class="autofill-block">
          <!-- Hidden inputs to confuse Chrome's autofill -->
          <input type="text" style="display:none" name="address-line1" autocomplete="off" />
          <input type="text" style="display:none" name="street-address" autocomplete="off" />
          <input type="text" style="display:none" name="address1" autocomplete="off" />
          <input type="text" style="display:none" name="address" autocomplete="off" />
        </div>
        <FormInput
          id="address"
          label="Address"
          type="textarea"
          :model-value="address.street"
          :is-valid="validationStates.address.valid"
          :is-touched="validationStates.address.touched"
          :required="true"
          :error-message="'Please enter an address.'"
          next-field-id="postalCode"
          autocomplete="off"
          @update:model-value="updateStreet"
          @input="handleStreetInput"
        />
      </div>

      <!-- Postal Code -->
      <div class="col-12">
        <FormInput
          id="postalCode"
          label="Postal Code"
          type="text"
          :model-value="address.postal_code"
          :is-valid="validationStates.postalCode.valid"
          :is-touched="validationStates.postalCode.touched"
          :required="true"
          :error-message="'Please enter a postal code.'"
          @update:model-value="updatePostalCode"
          @input="handlePostalCodeInput"
        />
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import FormInput from '@/components/common/FormInput.vue'
import axiosInstance from '@/config/axios'

// Define interfaces
interface Country {
  id: number
  name: string
}

interface State {
  id: number
  name: string
  country_id: number
}

interface City {
  id: number
  name: string
  state_id: number
}

interface Address {
  street: string
  postal_code: string
  city_id: number
  state_id: number
  country_id: number
}

interface ValidationState {
  valid: boolean
  touched: boolean
}

interface ValidationStates {
  country: ValidationState
  state: ValidationState
  city: ValidationState
  address: ValidationState
  postalCode: ValidationState
}

// Props
const props = withDefaults(
  defineProps<{
    title: string
    modelValue: Address
    validationStates: ValidationStates
  }>(),
  {
    title: 'Entity',
  },
)

// Emit
const emit = defineEmits<{
  (e: 'update:modelValue', value: Address): void
  (e: 'update:validationStates', value: ValidationStates): void
  (e: 'country-change', country: Country | null): void
  (e: 'state-change', state: State | null): void
  (e: 'city-change', city: City | null): void
}>()

// Data refs
const countries = ref<Country[]>([])
const states = ref<State[]>([])
const cities = ref<City[]>([])
const loadingStates = ref(false)
const selectedCountry = ref<Country | null>(null)
const selectedState = ref<State | null>(null)
const selectedCity = ref<City | null>(null)
const isInitialized = ref(false)

// Computed property for the address
const address = computed(() => props.modelValue)

// Fetch country data on mount
onMounted(async () => {
  // First fetch all countries
  await fetchCountries()
  
  // Wait a small delay to ensure countries are loaded properly
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // ✅ Mark as initialized after countries are loaded
  isInitialized.value = true
  
  // If address already has data, initialize selections
  if (address.value.country_id && address.value.state_id && address.value.city_id) {
    await fetchInitialData()
  }
})

// Fetch countries
const fetchCountries = async () => {
  try {
    const response = await axiosInstance.get('/countries')
    countries.value = response.data
    
    // If we have a country_id, select the country
    if (address.value.country_id) {
      const country = countries.value.find(c => c.id === address.value.country_id)
      if (country) {
        selectedCountry.value = country
      }
    }
  } catch (error) {
    console.error('Error fetching countries:', error)
  }
}

// Fetch initial data for editing
const fetchInitialData = async () => {
  try {
    if (!address.value.country_id) return
    
    await fetchAndSetCountry()
    if (address.value.state_id) {
      await fetchAndSetState()
      if (address.value.city_id) {
        await fetchAndSetCity()
      }
    }
    
    updateValidationStates()
  } catch (error) {
    console.error('Error fetching initial address data:', error)
  }
}

// Helper function to fetch and set country
const fetchAndSetCountry = async () => {
  const country = countries.value.find(c => c.id === address.value.country_id)
  if (!country) return
  
  selectedCountry.value = country
  
  // ✅ Improved caching: Only fetch states if we don't have any OR if they're for a different country
  const hasStatesForThisCountry = states.value.some(s => s.country_id === address.value.country_id)
  
  if (hasStatesForThisCountry) {
    console.log(`✅ Using cached states for country ${address.value.country_id}`)
  } else {
    console.log(`📡 Fetching states for country ${address.value.country_id}`)
    const statesResponse = await axiosInstance.get(`/states?countryId=${address.value.country_id}`)
    states.value = statesResponse.data
  }
  
  // Short delay to ensure states are processed
  await new Promise(resolve => setTimeout(resolve, 100))
}

// Helper function to fetch and set state
const fetchAndSetState = async () => {
  const state = states.value.find(s => s.id === address.value.state_id)
  if (!state) return
  
  selectedState.value = state
  
  // ✅ Improved caching: Only fetch cities if we don't have any OR if they're for a different state
  const hasCitiesForThisState = cities.value.some(c => c.state_id === address.value.state_id)
  
  if (hasCitiesForThisState) {
    console.log(`✅ Using cached cities for state ${address.value.state_id}`)
  } else {
    console.log(`📡 Fetching cities for state ${address.value.state_id}`)
    const citiesResponse = await axiosInstance.get(`/cities?stateId=${address.value.state_id}`)
    cities.value = citiesResponse.data
  }
  
  // Short delay to ensure cities are processed
  await new Promise(resolve => setTimeout(resolve, 100))
}

// Helper function to fetch and set city
const fetchAndSetCity = async () => {
  const city = cities.value.find(c => c.id === address.value.city_id)
  if (city) {
    selectedCity.value = city
  }
}

// Update validation states
const updateValidationStates = () => {
  const updatedValidation = {
    ...props.validationStates,
    country: {
      valid: !!selectedCountry.value,
      touched: !!selectedCountry.value,
    },
    state: {
      valid: !!selectedState.value,
      touched: !!selectedState.value,
    },
    city: {
      valid: !!selectedCity.value,
      touched: !!selectedCity.value,
    },
    address: {
      valid: address.value.street.trim().length > 0,
      touched: address.value.street.trim().length > 0,
    },
    postalCode: {
      valid: address.value.postal_code.trim().length > 0,
      touched: address.value.postal_code.trim().length > 0,
    }
  }
  
  emit('update:validationStates', updatedValidation)
}

// Country change
const handleCountryChange = async (value: Country | null) => {
  try {
    console.log('🌍 User changed country:', value?.name)
    
    // Update selected country
    selectedCountry.value = value
    
    // Reset state and city
    selectedState.value = null
    selectedCity.value = null
    states.value = []
    cities.value = []
    
    // Update address data
    const updatedAddress = {
      ...address.value,
      country_id: value?.id ?? 0,
      state_id: 0,
      city_id: 0,
    }
    emit('update:modelValue', updatedAddress)
    
    // Update validation states
    const updatedValidation = {
      ...props.validationStates,
      country: {
        valid: !!value,
        touched: true,
      },
      state: {
        valid: false,
        touched: false,
      },
      city: {
        valid: false,
        touched: false,
      }
    }
    emit('update:validationStates', updatedValidation)
    
    // Emit country change
    emit('country-change', value)
    
    // ✅ Fetch states for this country (user-triggered, so always fetch fresh data)
    if (value?.id) {
      console.log(`📡 User-triggered: Fetching states for country ${value.id}`)
      loadingStates.value = true
      try {
        const response = await axiosInstance.get(`/states?countryId=${value.id}`)
        states.value = response.data
      } finally {
        loadingStates.value = false
      }
    }
  } catch (error) {
    console.error('Error in handleCountryChange:', error)
    loadingStates.value = false
  }
}

// State change
const handleStateChange = async (value: State | null) => {
  try {
    console.log('🏛️ User changed state:', value?.name)
    
    // Update selected state
    selectedState.value = value
    
    // Reset city
    selectedCity.value = null
    cities.value = []
    
    // Update address data
    const updatedAddress = {
      ...address.value,
      state_id: value?.id ?? 0,
      city_id: 0,
    }
    emit('update:modelValue', updatedAddress)
    
    // Update validation states
    const updatedValidation = {
      ...props.validationStates,
      state: {
        valid: !!value,
        touched: true,
      },
      city: {
        valid: false,
        touched: false,
      }
    }
    emit('update:validationStates', updatedValidation)
    
    // Emit state change
    emit('state-change', value)
    
    // ✅ Fetch cities for this state (user-triggered, so always fetch fresh data)
    if (value?.id) {
      console.log(`📡 User-triggered: Fetching cities for state ${value.id}`)
      const response = await axiosInstance.get(`/cities?stateId=${value.id}`)
      cities.value = response.data
    }
  } catch (error) {
    console.error('Error in handleStateChange:', error)
  }
}

// City change
const handleCityChange = (value: City | null) => {
  // Update selected city
  selectedCity.value = value
  
  // Update address data
  const updatedAddress = {
    ...address.value,
    city_id: value?.id ?? 0,
  }
  emit('update:modelValue', updatedAddress)
  
  // Update validation states
  const updatedValidation = {
    ...props.validationStates,
    city: {
      valid: !!value,
      touched: true,
    }
  }
  emit('update:validationStates', updatedValidation)
  
  // Emit city change
  emit('city-change', value)
}

// Street input
const updateStreet = (value: string) => {
  const updatedAddress = {
    ...address.value,
    street: value,
  }
  emit('update:modelValue', updatedAddress)
}

const handleStreetInput = () => {
  // Update validation states
  const updatedValidation = {
    ...props.validationStates,
    address: {
      valid: !!address.value.street.trim(),
      touched: true,
    }
  }
  emit('update:validationStates', updatedValidation)
}

// Postal code input
const updatePostalCode = (value: string) => {
  const updatedAddress = {
    ...address.value,
    postal_code: value,
  }
  emit('update:modelValue', updatedAddress)
}

const handlePostalCodeInput = () => {
  // Update validation states
  const updatedValidation = {
    ...props.validationStates,
    postalCode: {
      valid: !!address.value.postal_code.trim(),
      touched: true,
    }
  }
  emit('update:validationStates', updatedValidation)
}

// Watch for address changes from parent - consolidated watcher
watch(
  () => address.value,
  async (newAddress) => {
    // ✅ Only proceed if component is initialized and countries are loaded
    if (!isInitialized.value || countries.value.length === 0) {
      return
    }
    
    // ✅ Only re-initialize if we have all location IDs but missing selections
    // AND this isn't the initial load (which is handled by onMounted)
    if (
      newAddress.country_id && 
      newAddress.state_id && 
      newAddress.city_id && 
      (!selectedCountry.value || !selectedState.value || !selectedCity.value)
    ) {
      console.log('🔄 Re-initializing address data from watcher')
      await fetchInitialData()
    }
  },
  { deep: true, immediate: false } // ✅ Changed to immediate: false to prevent duplicate calls
)
</script>

<style scoped>
.form-floating {
  margin-bottom: 0;
}

.invalid-feedback {
  display: none;
}

.is-invalid ~ .invalid-feedback {
  display: block;
}
</style> 