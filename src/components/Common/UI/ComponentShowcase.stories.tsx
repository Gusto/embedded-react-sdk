import { useState } from 'react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { LocaleProvider } from '@/contexts/LocaleProvider'

export default {
  title: 'UI/Components/Showcase',
}

// Mock data for demonstration
const travelDestinations = [
  { value: 'paris', label: 'Paris', description: 'City of Lights' },
  { value: 'tokyo', label: 'Tokyo', description: 'Modern metropolis' },
  { value: 'nyc', label: 'New York', description: 'The Big Apple' },
  { value: 'sydney', label: 'Sydney', description: 'Harbor city' },
  { value: 'rome', label: 'Rome', description: 'Eternal City' },
]

const accommodationTypes = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'villa', label: 'Villa' },
]

const amenities = [
  { value: 'wifi', label: 'WiFi', description: 'Free high-speed internet' },
  { value: 'pool', label: 'Swimming Pool', description: 'Outdoor heated pool' },
  { value: 'breakfast', label: 'Breakfast', description: 'Continental breakfast included' },
  { value: 'parking', label: 'Parking', description: 'Free on-site parking' },
]

const transportOptions = [
  { value: 'economy', label: 'Economy', description: '$50' },
  { value: 'standard', label: 'Standard', description: '$100' },
  { value: 'premium', label: 'Premium', description: '$200' },
]

interface FormState {
  destination: string
  checkIn: Date | null
  checkOut: Date | null
  guests: number
  accommodationType: string
  amenities: string[]
  transportOption: string
  budget: number
  specialRequests: string
  notifications: boolean
  termsAgreed: boolean
}

export const TravelBookingApp = () => {
  const Components = useComponentContext()
  const [formState, setFormState] = useState<FormState>({
    destination: '',
    checkIn: null,
    checkOut: null,
    guests: 2,
    accommodationType: 'hotel',
    amenities: ['wifi'],
    transportOption: 'standard',
    budget: 2000,
    specialRequests: '',
    notifications: true,
    termsAgreed: false,
  })

  const updateFormField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <Components.Alert status="info" label="Explore our new destinations!">
          Book by the end of the month to receive a 15% discount.
        </Components.Alert>

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <h1>Dream Vacation Planner</h1>
          <p>Plan your perfect getaway with our easy-to-use booking tool</p>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <Components.ComboBox
              label="Where do you want to go?"
              name="destination"
              options={travelDestinations}
              value={formState.destination}
              onChange={value => {
                updateFormField('destination', value)
              }}
              placeholder="Select a destination"
              isRequired
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <Components.DatePicker
                label="Check-in"
                name="checkIn"
                value={formState.checkIn}
                onChange={value => {
                  updateFormField('checkIn', value)
                }}
                isRequired
              />
              <Components.DatePicker
                label="Check-out"
                name="checkOut"
                value={formState.checkOut}
                onChange={value => {
                  updateFormField('checkOut', value)
                }}
                isRequired
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <Components.NumberInput
                label="Number of Guests"
                name="guests"
                value={formState.guests}
                onChange={value => {
                  updateFormField('guests', value)
                }}
                min={1}
                max={10}
              />
            </div>
          </div>

          <div style={{ flex: '1', minWidth: '300px' }}>
            <Components.Select
              label="Accommodation Type"
              name="accommodationType"
              options={accommodationTypes}
              value={formState.accommodationType}
              onChange={value => {
                updateFormField('accommodationType', value)
              }}
            />

            <div style={{ marginTop: '20px' }}>
              <Components.NumberInput
                label="Budget (USD)"
                name="budget"
                value={formState.budget}
                onChange={value => {
                  updateFormField('budget', value)
                }}
                min={100}
                format="currency"
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <Components.TextInput
                label="Special Requests"
                name="specialRequests"
                value={formState.specialRequests}
                onChange={value => {
                  updateFormField('specialRequests', value)
                }}
                placeholder="Any special requirements?"
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>Amenities</h3>
          <Components.CheckboxGroup
            label="Select desired amenities"
            options={amenities}
            value={formState.amenities}
            onChange={value => {
              updateFormField('amenities', value)
            }}
          />
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>Transportation</h3>
          <Components.RadioGroup
            label="Choose your transportation package"
            options={transportOptions}
            value={formState.transportOption}
            onChange={value => {
              updateFormField('transportOption', value)
            }}
          />
        </div>

        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Components.Switch
            label="Receive travel updates and offers"
            name="notifications"
            value={formState.notifications}
            onChange={value => {
              updateFormField('notifications', value)
            }}
          />

          <Components.Checkbox
            label="I agree to the terms and conditions"
            name="termsAgreed"
            value={formState.termsAgreed}
            onChange={value => {
              updateFormField('termsAgreed', value)
            }}
            isRequired
          />
        </div>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <Components.Button variant="secondary">Cancel</Components.Button>
          <Components.Button isDisabled={!formState.termsAgreed}>Book Now</Components.Button>
        </div>

        {formState.termsAgreed && formState.destination && (
          <div style={{ marginTop: '30px' }}>
            <Components.Alert status="success" label="Ready to book!">
              Your dream vacation to{' '}
              {travelDestinations.find(d => d.value === formState.destination)?.label ||
                formState.destination}{' '}
              is just a click away.
            </Components.Alert>
          </div>
        )}
      </div>
    </LocaleProvider>
  )
}

interface ProfileFormState {
  fullName: string
  email: string
  birthdate: Date | null
  occupation: string
  interests: string[]
  bio: string
  notifications: {
    email: boolean
    sms: boolean
    promotions: boolean
  }
  theme: string
}

export const UserProfileDemo = () => {
  const Components = useComponentContext()
  const [isEditMode, setIsEditMode] = useState(false)
  const [formState, setFormState] = useState<ProfileFormState>({
    fullName: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    birthdate: new Date('1990-05-15'),
    occupation: 'software',
    interests: ['travel', 'tech'],
    bio: 'Tech enthusiast and avid traveler.',
    notifications: {
      email: true,
      sms: false,
      promotions: true,
    },
    theme: 'light',
  })

  const updateFormField = <K extends keyof ProfileFormState>(
    field: K,
    value: ProfileFormState[K],
  ) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateNotification = (field: keyof ProfileFormState['notifications'], value: boolean) => {
    setFormState(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }))
  }

  const occupationOptions = [
    { value: 'software', label: 'Software Developer' },
    { value: 'design', label: 'Designer' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'other', label: 'Other' },
  ]

  const interestOptions = [
    { value: 'tech', label: 'Technology', description: 'Gadgets, software, AI' },
    { value: 'travel', label: 'Travel', description: 'Exploring new places' },
    { value: 'cooking', label: 'Cooking', description: 'Culinary adventures' },
    { value: 'fitness', label: 'Fitness', description: 'Sports and wellness' },
    { value: 'art', label: 'Art & Design', description: 'Creative pursuits' },
  ]

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
          <h1>User Profile</h1>
          <p>Manage your personal information and preferences</p>

          <div
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
            }}
          >
            <Components.Button
              variant={isEditMode ? 'secondary' : 'primary'}
              onClick={() => {
                setIsEditMode(!isEditMode)
              }}
            >
              {isEditMode ? 'Cancel Editing' : 'Edit Profile'}
            </Components.Button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <Components.TextInput
              label="Full Name"
              name="fullName"
              value={formState.fullName}
              onChange={value => {
                updateFormField('fullName', value)
              }}
              isDisabled={!isEditMode}
              isRequired
            />

            <div style={{ marginTop: '20px' }}>
              <Components.TextInput
                label="Email Address"
                name="email"
                value={formState.email}
                onChange={value => {
                  updateFormField('email', value)
                }}
                isDisabled={!isEditMode}
                isRequired
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <Components.DatePicker
                label="Birth Date"
                name="birthdate"
                value={formState.birthdate}
                onChange={value => {
                  updateFormField('birthdate', value)
                }}
                isDisabled={!isEditMode}
              />
            </div>
          </div>

          <div style={{ flex: '1', minWidth: '300px' }}>
            <Components.Select
              label="Occupation"
              name="occupation"
              options={occupationOptions}
              value={formState.occupation}
              onChange={value => {
                updateFormField('occupation', value)
              }}
              isDisabled={!isEditMode}
            />

            <div style={{ marginTop: '20px' }}>
              <Components.TextInput
                label="Bio"
                name="bio"
                value={formState.bio}
                onChange={value => {
                  updateFormField('bio', value)
                }}
                isDisabled={!isEditMode}
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <Components.CheckboxGroup
                label="Interests"
                options={interestOptions}
                value={formState.interests}
                onChange={value => {
                  updateFormField('interests', value)
                }}
                isDisabled={!isEditMode}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>Notification Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Components.Switch
              label="Email Notifications"
              name="emailNotifications"
              value={formState.notifications.email}
              onChange={value => {
                updateNotification('email', value)
              }}
              isDisabled={!isEditMode}
            />

            <Components.Switch
              label="SMS Notifications"
              name="smsNotifications"
              value={formState.notifications.sms}
              onChange={value => {
                updateNotification('sms', value)
              }}
              isDisabled={!isEditMode}
            />

            <Components.Switch
              label="Promotional Content"
              name="promotions"
              value={formState.notifications.promotions}
              onChange={value => {
                updateNotification('promotions', value)
              }}
              isDisabled={!isEditMode}
            />
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>Theme Preference</h3>
          <Components.RadioGroup
            label="Choose your interface theme"
            options={[
              { value: 'light', label: 'Light Mode', description: 'Bright interface' },
              { value: 'dark', label: 'Dark Mode', description: 'Reduced eye strain' },
              { value: 'system', label: 'System Default', description: 'Follow system settings' },
            ]}
            value={formState.theme}
            onChange={value => {
              updateFormField('theme', value)
            }}
            isDisabled={!isEditMode}
          />
        </div>

        {isEditMode && (
          <div
            style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}
          >
            <Components.Button
              variant="secondary"
              onClick={() => {
                setIsEditMode(false)
              }}
            >
              Cancel
            </Components.Button>
            <Components.Button
              onClick={() => {
                setIsEditMode(false)
              }}
            >
              Save Changes
            </Components.Button>
          </div>
        )}

        {!isEditMode && (
          <div style={{ marginTop: '30px' }}>
            <Components.Alert status="info" label="Profile Information">
              Your profile information is only visible to you and our support team.
            </Components.Alert>
          </div>
        )}
      </div>
    </LocaleProvider>
  )
}
