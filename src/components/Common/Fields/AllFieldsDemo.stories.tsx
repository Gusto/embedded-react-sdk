import type { Story } from '@ladle/react'
import { FormWrapper } from '../../../../.ladle/helpers/FormWrapper'
import { LocaleProvider } from '../../../contexts/LocaleProvider'
import { Grid } from '../../Common'
import { TextInputField } from './TextInputField'
import { NumberInputField } from './NumberInputField'
import { CheckboxField } from './CheckboxField'
import { SelectField } from './SelectField'
import { ComboBoxField } from './ComboBoxField'
import { RadioGroupField } from './RadioGroupField'
import { CheckboxGroupField } from './CheckboxGroupField'
import { DatePickerField } from './DatePickerField/DatePickerField'
import { SwitchField } from './SwitchField/SwitchField'

// Adding a meta object for title
export default {
  title: 'UI/Form/Examples',
}

// Demo data for select/combobox fields
const categories = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports' },
]

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'au', label: 'Australia' },
]

const shippingMethods = [
  { value: 'standard', label: 'Standard (3-5 days)', description: 'Free' },
  { value: 'express', label: 'Express (1-2 days)', description: '+$12.99' },
  { value: 'overnight', label: 'Overnight', description: '+$24.99' },
]

const notificationOptions = [
  { value: 'email', label: 'Email', description: 'Get updates via email' },
  { value: 'sms', label: 'SMS', description: 'Get updates via text message' },
  { value: 'push', label: 'Push', description: 'Get updates via push notifications' },
  { value: 'phone', label: 'Phone', description: 'Get updates via phone call' },
]

export const AllFieldsDemo: Story = () => {
  const defaultValues = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '',
    address: '',
    city: '',
    country: 'us',
    productCategory: 'electronics',
    price: 99.99,
    quantity: 1,
    discount: 10,
    priority: 'medium',
    deliveryDate: new Date(),
    agreeTerms: false,
    receiveUpdates: true,
    expressShipping: false,
    giftWrap: false,
    notes: '',
    shippingMethod: 'standard',
    notificationPreferences: ['email', 'push'],
  }

  return (
    <LocaleProvider locale="en-US" currency="USD">
      <FormWrapper defaultValues={defaultValues}>
        {/* Personal Information Section */}
        <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={16}>
          <TextInputField
            label="First Name"
            name="firstName"
            isRequired
            errorMessage="First name is required"
            description="Enter your legal first name"
          />

          <TextInputField
            label="Last Name"
            name="lastName"
            isRequired
            errorMessage="Last name is required"
            description="Enter your legal last name"
          />
        </Grid>

        <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={16}>
          <TextInputField
            label="Email"
            name="email"
            isRequired
            errorMessage="Valid email is required"
            description="Your primary email address for order confirmations"
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
          />

          <TextInputField
            label="Phone Number"
            name="phone"
            description="Optional phone number for shipping updates"
          />
        </Grid>

        {/* Address Section */}
        <Grid gridTemplateColumns={{ base: '1fr' }} gap={16}>
          <TextInputField
            label="Address"
            name="address"
            isRequired
            errorMessage="Shipping address is required"
            description="Enter your full street address"
          />
        </Grid>

        <Grid gridTemplateColumns={{ base: '1fr', small: ['2fr', '1fr'] }} gap={16}>
          <TextInputField
            label="City"
            name="city"
            isRequired
            errorMessage="City is required"
            description="City or township for delivery"
          />

          <ComboBoxField
            label="Country"
            name="country"
            options={countries}
            isRequired
            errorMessage="Country is required"
            description="Select or search for your country"
          />
        </Grid>

        {/* Product Information Section */}
        <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr'] }} gap={16}>
          <SelectField
            label="Product Category"
            name="productCategory"
            options={categories}
            placeholder="Select a category"
            isRequired
            errorMessage="Product category is required"
            description="Choose the type of product you're ordering"
          />

          <SelectField
            label="Priority"
            name="priority"
            options={priorities}
            description="Shipping priority level"
          />
        </Grid>

        <Grid gridTemplateColumns={{ base: '1fr' }} gap={16}>
          <RadioGroupField
            label="Shipping Method"
            name="shippingMethod"
            options={shippingMethods}
            isRequired
            errorMessage="Please select a shipping method"
            description="Choose your preferred shipping method"
          />
        </Grid>

        <Grid gridTemplateColumns={{ base: '1fr' }} gap={16}>
          <DatePickerField
            label="Delivery Date"
            name="deliveryDate"
            isRequired
            errorMessage="Delivery date is required"
            description="When would you like your order to be delivered?"
          />
        </Grid>

        <Grid gridTemplateColumns={{ base: '1fr' }} gap={16}>
          <CheckboxGroupField
            label="Notification Preferences"
            name="notificationPreferences"
            options={notificationOptions}
            description="Select all the ways you'd like to receive updates"
          />
        </Grid>

        <Grid gridTemplateColumns={{ base: '1fr' }} gap={16}>
          <SwitchField
            label="Express Shipping"
            name="expressShipping"
            description="24-hour expedited delivery (+$15.00)"
          />
        </Grid>

        {/* Pricing Section */}
        <Grid gridTemplateColumns={{ base: '1fr', small: ['1fr', '1fr', '1fr'] }} gap={16}>
          <NumberInputField
            label="Price"
            name="price"
            format="currency"
            isRequired
            errorMessage="Price is required"
            description="Base price before discounts"
            rules={{
              min: { value: 0.01, message: 'Price must be greater than zero' },
            }}
          />

          <NumberInputField
            label="Quantity"
            name="quantity"
            format="decimal"
            isRequired
            errorMessage="Quantity is required"
            description="Number of items to purchase"
            min={1}
            rules={{
              min: { value: 1, message: 'Quantity must be at least 1' },
            }}
          />

          <NumberInputField
            label="Discount"
            name="discount"
            format="percent"
            description="Percentage discount to apply"
            rules={{
              min: { value: 0, message: 'Discount cannot be negative' },
              max: { value: 100, message: 'Discount cannot exceed 100%' },
            }}
          />
        </Grid>

        {/* Options Section */}
        <Grid gridTemplateColumns={{ base: '1fr' }} gap={12}>
          <CheckboxField
            label="I agree to the terms and conditions"
            name="agreeTerms"
            isRequired
            errorMessage="You must agree to the terms"
            description="By checking this box, you agree to our terms of service and privacy policy"
          />

          <CheckboxField
            label="I would like to receive product updates via email"
            name="receiveUpdates"
            description="Get notified about new products, sales, and promotions"
          />

          <CheckboxField
            label="Add gift wrapping (+$5.00)"
            name="giftWrap"
            description="Includes premium wrapping paper and a gift message card"
          />
        </Grid>

        {/* Notes Section */}
        <Grid gridTemplateColumns={{ base: '1fr' }} gap={16}>
          <TextInputField
            label="Order Notes"
            name="notes"
            description="Any special instructions or delivery requests"
          />
        </Grid>
      </FormWrapper>
    </LocaleProvider>
  )
}
