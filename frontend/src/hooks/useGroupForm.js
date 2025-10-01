import { useState, useCallback } from "react";
import useApi from "./useApi";

/**
 * Custom hook for managing group creation form and logic
 * @returns {object} Group form state and methods
 */
const useGroupForm = () => {
  const { post, loading, error } = useApi();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_public: true,
  });

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Group name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Group name must be at least 3 characters";
    } else if (formData.name.trim().length > 50) {
      errors.name = "Group name must be less than 50 characters";
    }

    if (formData.description.trim().length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    return errors;
  }, [formData]);

  // Check if form is valid
  const isValid = useCallback(() => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  }, [validateForm]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      is_public: true,
    });
    setSuccess(false);
  }, []);

  // Submit form
  const submitForm = useCallback(
    async onSuccess => {
      if (!isValid()) {
        throw new Error("Form validation failed");
      }

      try {
        const result = await post("groups", formData);

        // Show success message
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);

        // Close modal and reset form
        setIsModalOpen(false);
        resetForm();

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === "function") {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        throw err;
      }
    },
    [formData, isValid, post, resetForm]
  );

  // Handle modal open
  const openModal = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  // Handle modal close
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  // Handle form submission with default behavior
  const handleSubmit = useCallback(
    async onSuccess => {
      try {
        await submitForm(onSuccess);
      } catch (err) {
        console.error("Group creation failed:", err);
        // Error is already handled by useApi hook
      }
    },
    [submitForm]
  );

  // Get form validation errors
  const getErrors = useCallback(() => {
    return validateForm();
  }, [validateForm]);

  // Check if a specific field has an error
  const hasError = useCallback(
    field => {
      const errors = validateForm();
      return !!errors[field];
    },
    [validateForm]
  );

  // Get error message for a specific field
  const getFieldError = useCallback(
    field => {
      const errors = validateForm();
      return errors[field] || null;
    },
    [validateForm]
  );

  return {
    // Form state
    formData,
    isModalOpen,
    success,
    loading,
    error,

    // Computed properties
    isValid: isValid(),
    errors: getErrors(),

    // Form methods
    updateField,
    resetForm,
    submitForm,
    handleSubmit,

    // Modal methods
    openModal,
    closeModal,

    // Validation methods
    validateForm,
    hasError,
    getFieldError,
  };
};

export default useGroupForm;
