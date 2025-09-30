import { useState, useCallback, useEffect } from "react";
import useApi from "./useApi";
import useAuth from "./useAuth";

/**
 * Custom hook for managing profile form and editing logic
 * @returns {object} Profile form state and methods
 */
const useProfileForm = () => {
  const { user, refreshUser } = useAuth();
  const { put, loading, error } = useApi();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subjects_of_interest: [],
  });

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [success, setSuccess] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        subjects_of_interest: user.subjects_of_interest || [],
      });
    }
  }, [user]);

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Update name field specifically
  const updateName = useCallback(
    name => {
      updateField("name", name);
    },
    [updateField]
  );

  // Add subject to interests
  const addSubject = useCallback(() => {
    const trimmedSubject = newSubject.trim();

    if (!trimmedSubject) return;

    if (formData.subjects_of_interest.includes(trimmedSubject)) {
      return; // Subject already exists
    }

    setFormData(prev => ({
      ...prev,
      subjects_of_interest: [...prev.subjects_of_interest, trimmedSubject],
    }));

    setNewSubject("");
  }, [newSubject, formData.subjects_of_interest]);

  // Remove subject from interests
  const removeSubject = useCallback(subjectToRemove => {
    setFormData(prev => ({
      ...prev,
      subjects_of_interest: prev.subjects_of_interest.filter(
        subject => subject !== subjectToRemove
      ),
    }));
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      errors.name = "Name must be less than 100 characters";
    }

    // Validate subjects
    if (formData.subjects_of_interest.length > 20) {
      errors.subjects = "Maximum 20 subjects allowed";
    }

    // Check for empty subjects
    const hasEmptySubjects = formData.subjects_of_interest.some(
      subject => !subject.trim()
    );
    if (hasEmptySubjects) {
      errors.subjects = "Subjects cannot be empty";
    }

    return errors;
  }, [formData]);

  // Check if form is valid
  const isValid = useCallback(() => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  }, [validateForm]);

  // Check if form has changes from original user data
  const hasChanges = useCallback(() => {
    if (!user) return false;

    return (
      formData.name !== (user.name || "") ||
      JSON.stringify(formData.subjects_of_interest) !==
        JSON.stringify(user.subjects_of_interest || [])
    );
  }, [user, formData]);

  // Start editing mode
  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Cancel editing and reset form
  const cancelEditing = useCallback(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        subjects_of_interest: user.subjects_of_interest || [],
      });
    }
    setIsEditing(false);
    setNewSubject("");
  }, [user]);

  // Submit form
  const submitForm = useCallback(async () => {
    if (!isValid()) {
      throw new Error("Form validation failed");
    }

    try {
      await put("/auth/profile", formData);

      // Refresh user data
      refreshUser();

      // Show success and exit editing mode
      setSuccess(true);
      setIsEditing(false);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

      return true;
    } catch (err) {
      throw err;
    }
  }, [formData, isValid, put, refreshUser]);

  // Handle subject input key press
  const handleSubjectKeyPress = useCallback(
    event => {
      if (event.key === "Enter") {
        event.preventDefault();
        addSubject();
      }
    },
    [addSubject]
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

  // Check if can add more subjects
  const canAddSubject = useCallback(() => {
    return (
      newSubject.trim().length > 0 &&
      !formData.subjects_of_interest.includes(newSubject.trim()) &&
      formData.subjects_of_interest.length < 20
    );
  }, [newSubject, formData.subjects_of_interest]);

  return {
    // Form state
    formData,
    newSubject,
    isEditing,
    success,
    loading,
    error,

    // Computed properties
    isValid: isValid(),
    hasChanges: hasChanges(),
    canAddSubject: canAddSubject(),
    errors: getErrors(),

    // Form field methods
    updateField,
    updateName,
    setNewSubject,

    // Subject management
    addSubject,
    removeSubject,
    handleSubjectKeyPress,

    // Form lifecycle methods
    startEditing,
    cancelEditing,
    submitForm,

    // Validation methods
    validateForm,
    hasError,
    getFieldError,
  };
};

export default useProfileForm;
