'use client'

import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Textarea } from "@nextui-org/input";
import { useUser } from '@/context/user-context';
import { useState, useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/autocomplete";

const saProvinces = [
  { value: 'EC', label: 'Eastern Cape' },
  { value: 'FS', label: 'Free State' },
  { value: 'GP', label: 'Gauteng' },
  { value: 'KZN', label: 'KwaZulu-Natal' },
  { value: 'LP', label: 'Limpopo' },
  { value: 'MP', label: 'Mpumalanga' },
  { value: 'NC', label: 'Northern Cape' },
  { value: 'NW', label: 'North West' },
  { value: 'WC', label: 'Western Cape' }
];

// Function to format ID number with dashes
const formatIdNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 6) {
    return digits;
  } else if (digits.length <= 10) {
    return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  } else {
    return `${digits.slice(0, 6)}-${digits.slice(6, 10)}-${digits.slice(10, 13)}`;
  }
};

// Function to format phone number with country code and dashes
const formatPhoneNumber = (value: string) => {
  // Remove all non-digits
  let digits = value.replace(/\D/g, '');
  
  // If the number starts with 27, remove it
  if (digits.startsWith('27')) {
    digits = digits.substring(2);
  }
  
  // Format the remaining digits
  if (digits.length === 0) {
    return '+27 ';
  } else if (digits.length <= 2) {
    return `+27 ${digits}`;
  } else if (digits.length <= 5) {
    return `+27 ${digits.slice(0, 2)}-${digits.slice(2)}`;
  } else if (digits.length <= 9) {
    return `+27 ${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  } else {
    return `+27 ${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5, 9)}`;
  }
};

export default function ProfileForm() {
  const { globalUser } = useUser(); // Only need to read the user data
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Initialize form state with globalUser data
  const [formData, setFormData] = useState(() => ({
    street: globalUser?.address?.street || '',
    city: globalUser?.address?.city || '',
    state: globalUser?.address?.state || '',
    zipCode: globalUser?.address?.zipCode || '',
    bio: globalUser?.bio || '',
    idNumber: globalUser?.idNumber || '',
    phoneNumber: globalUser?.phoneNumber || ''
  }));

  const [selectedProvince, setSelectedProvince] = useState<string>(() => {
    return globalUser?.address?.state || '';
  });

  const [formattedId, setFormattedId] = useState(() => {
    return globalUser?.idNumber ? formatIdNumber(globalUser.idNumber) : '';
  });

  const [formattedPhone, setFormattedPhone] = useState(() => {
    return globalUser?.phoneNumber ? formatPhoneNumber(globalUser.phoneNumber) : '+27 ';
  });

  // Update form data when globalUser changes
  useEffect(() => {
    if (globalUser) {
      setFormData({
        street: globalUser.address?.street || '',
        city: globalUser.address?.city || '',
        state: globalUser.address?.state || '',
        zipCode: globalUser.address?.zipCode || '',
        bio: globalUser.bio || '',
        idNumber: globalUser.idNumber || '',
        phoneNumber: globalUser.phoneNumber || ''
      });
      setSelectedProvince(globalUser.address?.state || '');
      setFormattedId(globalUser.idNumber ? formatIdNumber(globalUser.idNumber) : '');
      setFormattedPhone(globalUser.phoneNumber ? formatPhoneNumber(globalUser.phoneNumber) : '+27 ');
    }
  }, [globalUser]);

  // Handle ID number input
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length <= 13) {
      const formatted = formatIdNumber(input);
      setFormData(prev => ({ ...prev, idNumber: input }));
      setFormattedId(formatted);
    }
  };

  // Handle phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    if (formatted.length <= 16) { // +27 XX-XXX-XXXX
      setFormData(prev => ({ ...prev, phoneNumber: input }));
      setFormattedPhone(formatted);
    }
  };

  // Add this function to handle province selection
  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setFormData(prev => ({ ...prev, state: value }));
    setErrors(prev => ({ ...prev, state: '' })); // Clear error when valid selection is made
  };

  const handleReset = () => {
    // Reset form data to initial values from globalUser
    setFormData({
      street: globalUser?.address?.street || '',
      city: globalUser?.address?.city || '',
      state: globalUser?.address?.state || '',
      zipCode: globalUser?.address?.zipCode || '',
      bio: globalUser?.bio || '',
      idNumber: globalUser?.idNumber || '',
      phoneNumber: globalUser?.phoneNumber || ''
    });
    // Reset formatted values
    setFormattedId(globalUser?.idNumber ? formatIdNumber(globalUser.idNumber) : '');
    setFormattedPhone(globalUser?.phoneNumber ? formatPhoneNumber(globalUser.phoneNumber) : '+27 ');
    // Reset province
    setSelectedProvince(globalUser?.address?.state || '');
    // Clear any errors
    setErrors({});
  };

  const validateForm = (formData: { [key: string]: string }): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate ID Number (exactly 13 digits)
    const idNumber = formData.idNumber;
    const digitsOnly = idNumber.replace(/\D/g, '');
    if (digitsOnly.length !== 13) {
      newErrors.idNumber = 'ID Number must be exactly 13 digits';
    }

    // Validate Phone Number (must start with +27 and have 9 digits after)
    const phoneNumber = formData.phoneNumber;
    const phoneDigits = phoneNumber.replace(/[^\d+]/g, '').substring(3); // Remove +27 and non-digits
    if (!phoneNumber.startsWith('+27') || phoneDigits.length !== 9) {
      newErrors.phoneNumber = 'Phone number must be 9 digits after +27';
    }

    // Validate Street Address
    const street = formData.street;
    if (!street || street.trim() === '') {
      newErrors.street = 'Street address is required';
    }

    // Validate City
    const city = formData.city;
    if (!city || city.trim() === '') {
      newErrors.city = 'City is required';
    }

    // Validate Province
    const province = formData.state;
    if (!province || province.trim() === '') {
      newErrors.state = 'Province is required';
    } else if (!saProvinces.some(p => p.value === province)) {
      newErrors.state = 'Please select a valid province from the list';
    }

    // Validate Postal Code
    const postalCode = formData.zipCode;
    if (!postalCode || postalCode.trim() === '') {
      newErrors.zipCode = 'Postal code is required';
    } else if (!/^\d+$/.test(postalCode)) {
      newErrors.zipCode = 'Postal code must contain only numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!validateForm(formData)) {
        setLoading(false);
        return;
      }

      // Remove formatting before sending to API
      const rawIdNumber = formattedId.replace(/-/g, '');
      const rawPhoneNumber = formattedPhone.replace(/[-\s]/g, '');

      const userData = {
        idNumber: rawIdNumber,
        phoneNumber: rawPhoneNumber,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        bio: formData.bio,
      };

      // Send data to API
      const response = await fetch('/api/globUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      
      // Show success message or redirect
      console.log('Profile updated successfully:', result);
      
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {/* Required Information */}
        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
          <Input
            isRequired
            name="idNumber"
            type="text"
            label="ID Number"
            placeholder="Enter your 13-digit ID number"
            value={formattedId}
            onChange={handleIdChange}
            isInvalid={!!errors.idNumber}
            errorMessage={errors.idNumber}
            description="South African ID number"
          />
          <Input
            isRequired
            name="phoneNumber"
            type="tel"
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formattedPhone}
            onChange={handlePhoneChange}
            isInvalid={!!errors.phoneNumber}
            errorMessage={errors.phoneNumber}
            description="South African phone number"
          />
        </div>

        {/* Address Information */}
        <div className="flex flex-col gap-2">
          <Input
            isRequired
            name="street"
            type="text"
            label="Street Address"
            placeholder="Enter your street address"
            value={formData.street}
            onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
            isInvalid={!!errors.street}
            errorMessage={errors.street}
          />
          <div className="flex w-full flex-wrap md:flex-nowrap gap-2">
            <Input
              isRequired
              name="city"
              type="text"
              label="City"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              isInvalid={!!errors.city}
              errorMessage={errors.city}
            />
            <Autocomplete
              isRequired
              name="state"
              label="Province"
              value={selectedProvince}
              selectedKey={selectedProvince}
              onSelectionChange={(key) => handleProvinceChange(key as string)}
              className="w-full"
              isInvalid={!!errors.state}
              errorMessage={errors.state}
            >
              {saProvinces.map((province) => (
                <AutocompleteItem key={province.value} value={province.value}>
                  {province.label}
                </AutocompleteItem>
              ))}
            </Autocomplete>
            <Input
              isRequired
              name="zipCode"
              type="text"
              label="Postal Code"
              placeholder="Postal Code"
              value={formData.zipCode}
              onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
              isInvalid={!!errors.zipCode}
              errorMessage={errors.zipCode}
            />
          </div>
        </div>

        {/* Optional Information */}
        <Textarea
          name="bio"
          label="Bio (Optional)"
          placeholder="Tell us about yourself"
          className="w-full"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          color="danger"
          variant="light"
          type="button"
          onPress={handleReset}
        >
          Reset
        </Button>
        <Button
          color="primary"
          type="submit"
          isLoading={loading}
        >
          Update
        </Button>
      </div>
    </form>
  );
}
