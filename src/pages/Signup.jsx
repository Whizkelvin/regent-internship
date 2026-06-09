import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { 
  FaUser, 
  FaUserTie, 
  FaShieldAlt, 
  FaGraduationCap, 
  FaPhone, 
  FaEnvelope, 
  FaLock, 
  FaCalendarAlt,
  FaIdCard,
  FaBuilding,
  FaArrowRight,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaToggleOn,
  FaToggleOff,
  FaUserCircle,
  FaAddressCard
} from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [program, setProgram] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    phone: "",
    companyName: "",
    program: "",
    graduationYear: ""
  });

  // Validate name (allow letters, spaces, hyphens, apostrophes - no numbers)
  const validateNameField = (value, fieldName) => {
    if (!value.trim()) {
      return `${fieldName} is required`;
    }
    if (/\d/.test(value)) {
      return `${fieldName} should not contain numbers`;
    }
    if (!/^[a-zA-Z\s\-']+$/.test(value)) {
      return `${fieldName} should only contain letters, spaces, hyphens, and apostrophes`;
    }
    if (value.length < 2) {
      return `${fieldName} must be at least 2 characters`;
    }
    if (value.length > 50) {
      return `${fieldName} must be less than 50 characters`;
    }
    return "";
  };

  // Validate email format
  const validateEmail = (value) => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    if (value.length > 100) {
      return "Email must be less than 100 characters";
    }
    if (role === "student" && !value.endsWith("@regent.edu.gh")) {
      return "Students must use @regent.edu.gh email address";
    }
    if (role === "company" && value.endsWith("@regent.edu.gh")) {
      return "Company representatives cannot use @regent.edu.gh email";
    }
    return "";
  };

  // Validate password strength
  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (value.length > 128) {
      return "Password must be less than 128 characters";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return "Password must contain at least one special character (!@#$%^&* etc.)";
    }
    if (/\s/.test(value)) {
      return "Password should not contain spaces";
    }
    return "";
  };

  // Validate confirm password
  const validateConfirmPassword = (value) => {
    if (!value) return "Please confirm your password";
    if (value !== password) {
      return "Passwords do not match";
    }
    return "";
  };

  // Validate student ID (alphanumeric, specific format)
  const validateStudentId = (value) => {
    if (!value) return "Student ID is required";
    if (!/^[A-Za-z0-9-]+$/.test(value)) {
      return "Student ID should only contain letters, numbers, and hyphens";
    }
    if (value.length < 6) {
      return "Student ID must be at least 6 characters";
    }
    if (value.length > 20) {
      return "Student ID must be less than 20 characters";
    }
    return "";
  };

  // Validate phone number (allows numbers, +, -, spaces, parentheses)
  const validatePhone = (value) => {
    if (!value) return "Phone number is required";
    // Remove all non-digit characters for length check
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return "Phone number must have at least 10 digits";
    }
    if (digitsOnly.length > 15) {
      return "Phone number must have less than 15 digits";
    }
    if (!/^[\d\s\+\(\)\-]+$/.test(value)) {
      return "Phone number contains invalid characters";
    }
    return "";
  };

  // Validate company name (allows letters, numbers, spaces, and common business symbols)
  const validateCompanyName = (value) => {
    if (!value.trim()) return "Company name is required";
    if (!/^[a-zA-Z0-9\s\&\'\-\.\,]+$/.test(value)) {
      return "Company name should only contain letters, numbers, spaces, and basic punctuation (&' -.,)";
    }
    if (value.length < 2) return "Company name must be at least 2 characters";
    if (value.length > 100) return "Company name must be less than 100 characters";
    return "";
  };

  // Validate program selection
  const validateProgram = (value) => {
    if (role === "student" && !value) return "Please select your academic program";
    return "";
  };

  // Validate graduation year
  const validateGraduationYear = (value) => {
    if (role === "student" && !value) return "Please select your graduation year";
    if (value) {
      const year = new Date(value).getFullYear();
      const currentYear = new Date().getFullYear();
      if (year < currentYear - 1) {
        return "Graduation year cannot be in the distant past";
      }
      if (year > currentYear + 10) {
        return "Graduation year seems too far in the future";
      }
    }
    return "";
  };

  // Handle name changes
  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setFirstName(value);
    setValidationErrors(prev => ({ ...prev, firstName: validateNameField(value, "First name") }));
  };

  const handleMiddleNameChange = (e) => {
    const value = e.target.value;
    setMiddleName(value);
    if (value && /\d/.test(value)) {
      setValidationErrors(prev => ({ ...prev, middleName: "Middle name should not contain numbers" }));
    } else {
      setValidationErrors(prev => ({ ...prev, middleName: "" }));
    }
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setLastName(value);
    setValidationErrors(prev => ({ ...prev, lastName: validateNameField(value, "Last name") }));
  };

  // Handle email change with validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setValidationErrors(prev => ({ ...prev, email: validateEmail(value) }));
  };

  // Handle password change with validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setValidationErrors(prev => ({ ...prev, password: validatePassword(value) }));
    if (confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword) }));
    }
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setValidationErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(value) }));
  };

  // Handle student ID change
  const handleStudentIdChange = (e) => {
    const value = e.target.value;
    setStudentId(value);
    setValidationErrors(prev => ({ ...prev, studentId: validateStudentId(value) }));
  };

  // Handle phone change
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    setValidationErrors(prev => ({ ...prev, phone: validatePhone(value) }));
  };

  // Handle company name change
  const handleCompanyNameChange = (e) => {
    const value = e.target.value;
    setCompanyName(value);
    setValidationErrors(prev => ({ ...prev, companyName: validateCompanyName(value) }));
  };

  // Handle program change
  const handleProgramChange = (e) => {
    const value = e.target.value;
    setProgram(value);
    setValidationErrors(prev => ({ ...prev, program: validateProgram(value) }));
  };

  // Handle graduation year change
  const handleGraduationYearChange = (e) => {
    const value = e.target.value;
    setGraduationYear(value);
    setValidationErrors(prev => ({ ...prev, graduationYear: validateGraduationYear(value) }));
  };

  // Get full name
  const getFullName = () => {
    let full = firstName;
    if (middleName) full += ` ${middleName}`;
    if (lastName) full += ` ${lastName}`;
    return full.trim();
  };

  // Get password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 1, text: "Weak", color: "text-red-600 bg-red-50" };
    if (strength <= 3) return { level: 2, text: "Medium", color: "text-yellow-600 bg-yellow-50" };
    if (strength <= 4) return { level: 3, text: "Good", color: "text-blue-600 bg-blue-50" };
    return { level: 4, text: "Strong", color: "text-green-600 bg-green-50" };
  };

  const passwordStrength = getPasswordStrength();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validate all fields based on role
    const firstNameError = validateNameField(firstName, "First name");
    const lastNameError = validateNameField(lastName, "Last name");
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);
    const phoneError = validatePhone(phone);

    let studentIdError = "";
    let companyNameError = "";
    let programError = "";
    let graduationYearError = "";

    if (role === "student") {
      studentIdError = validateStudentId(studentId);
      programError = validateProgram(program);
      graduationYearError = validateGraduationYear(graduationYear);
    }

    if (role === "company") {
      companyNameError = validateCompanyName(companyName);
    }

    if (!role) {
      setErrorMsg("Please select your role");
      return;
    }

    if (firstNameError || lastNameError || emailError || passwordError || 
        confirmPasswordError || phoneError || studentIdError || 
        companyNameError || programError || graduationYearError) {
      setValidationErrors({
        firstName: firstNameError,
        lastName: lastNameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
        phone: phoneError,
        studentId: studentIdError,
        companyName: companyNameError,
        program: programError,
        graduationYear: graduationYearError
      });
      setErrorMsg("Please fix the validation errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const fullName = getFullName();
      
      // Prepare user metadata based on role
      const userMetadata = {
        role,
        full_name: fullName,
        phone,
      };

      if (role === "student") {
        userMetadata.student_id = studentId;
        userMetadata.program = program;
        userMetadata.graduation_year = graduationYear;
      } else if (role === "company") {
        userMetadata.company_name = companyName;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
        },
      });

      if (error) throw error;

      // Insert into profiles table
      const profileData = {
        id: data.user?.id,
        email: email,
        full_name: fullName,
        role: role,
        phone: phone,
        created_at: new Date().toISOString(),
        status: 'active'
      };

      if (role === "student") {
        profileData.student_id = studentId;
        profileData.program = program;
        profileData.graduation_year = graduationYear;
      } else if (role === "company") {
        profileData.company_name = companyName;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      setSuccessMsg("Account created successfully! Please check your email for verification.");
      
      // Reset form
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setStudentId("");
      setProgram("");
      setGraduationYear("");
      setPhone("");
      setRole("");
      setCompanyName("");
      setValidationErrors({});

      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "student":
        return <FaGraduationCap className="w-6 h-6" />;
      case "company":
        return <FaBuilding className="w-6 h-6" />;
      case "admin":
        return <FaShieldAlt className="w-6 h-6" />;
      default:
        return <FaUser className="w-6 h-6" />;
    }
  };

  const getRoleDescription = () => {
    switch (role) {
      case "student":
        return "Join as a student to access internship opportunities and career resources";
      case "company":
        return "Register your company to post internships and connect with talented students";
      default:
        return "Select your role to get started";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-950/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-950/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-950/10 to-red-950/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                      <img
                        src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
                        alt="Regent University Badge"
                        className="w-16 h-16"
                      />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                      <p className="text-gray-600 mt-1">Join Regent Hub Career Platform</p>
                    </div>
                  </div>
                  <div className="w-24 h-1 bg-gradient-to-r from-green-950 to-red-950 rounded-full mx-auto"></div>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      I am a: <span className="text-red-950 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-900 transition-all duration-300 appearance-none"
                        required
                      >
                        <option value="">Select Your Role</option>
                        <option value="student">Student</option>
                        <option value="company">Company Representative</option>
                      </select>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {getRoleIcon()}
                      </div>
                    </div>
                    {role && (
                      <p className="text-xs text-gray-600 bg-green-50 p-2 rounded-lg border border-green-200">
                        {getRoleDescription()}
                      </p>
                    )}
                  </div>

                  {/* Name Fields - First, Middle, Last */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Full Name <span className="text-red-950 ml-1">*</span>
                    </label>
                    
                    {/* First Name */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={handleFirstNameChange}
                        className={`w-full p-4 pl-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300 ${
                          validationErrors.firstName ? 'border-red-500' : 'border-gray-200 focus:border-green-900'
                        }`}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUserCircle className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    {validationErrors.firstName && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <FaExclamationTriangle className="w-3 h-3 mr-1" /> {validationErrors.firstName}
                      </p>
                    )}

                    {/* Middle Name (Optional) */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Middle Name (Optional)"
                        value={middleName}
                        onChange={handleMiddleNameChange}
                        className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-900 transition-all duration-300"
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaAddressCard className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={handleLastNameChange}
                        className={`w-full p-4 pl-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300 ${
                          validationErrors.lastName ? 'border-red-500' : 'border-gray-200 focus:border-green-900'
                        }`}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUser className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    {validationErrors.lastName && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <FaExclamationTriangle className="w-3 h-3 mr-1" /> {validationErrors.lastName}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Email Address <span className="text-red-950 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={handleEmailChange}
                        className={`w-full p-4 pl-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300 ${
                          validationErrors.email ? 'border-red-500' : 'border-gray-200 focus:border-green-900'
                        }`}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaEnvelope className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    {validationErrors.email && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <FaExclamationTriangle className="w-3 h-3 mr-1" /> {validationErrors.email}
                      </p>
                    )}
                    {role === "student" && !validationErrors.email && email && email.endsWith("@regent.edu.gh") && (
                      <p className="text-xs text-green-600">✓ Using Regent email address</p>
                    )}
                  </div>

                  {/* Student ID (Students only) */}
                  {role === "student" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 block">
                        Student ID <span className="text-red-950 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter your student ID (e.g., 2023-1234)"
                          value={studentId}
                          onChange={handleStudentIdChange}
                          className={`w-full p-4 pl-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300 ${
                            validationErrors.studentId ? 'border-red-500' : 'border-gray-200 focus:border-green-900'
                          }`}
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaIdCard className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      {validationErrors.studentId && (
                        <p className="text-xs text-red-600 flex items-center mt-1">
                          <FaExclamationTriangle className="w-3 h-3 mr-1" /> {validationErrors.studentId}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">Format: Letters, numbers, and hyphens only (e.g., 2023-1234)</p>
                    </div>
                  )}

                  {/* Company Name (Companies only) */}
                  {role === "company" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 block">
                        Company Name <span className="text-red-950 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Enter your company name"
                          value={companyName}
                          onChange={handleCompanyNameChange}
                          className={`w-full p-4 pl-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300 ${
                            validationErrors.companyName ? 'border-red-500' : 'border-gray-200 focus:border-green-900'
                          }`}
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaBuilding className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      {validationErrors.companyName && (
                        <p className="text-xs text-red-600 flex items-center mt-1">
                          <FaExclamationTriangle className="w-3 h-3 mr-1" /> {validationErrors.companyName}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">Can include letters, numbers, spaces, and basic punctuation (&' -.,)</p>
                    </div>
                  )}

                  {/* Program Field (Students only) */}
                  {role === "student" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 block">
                        Academic Program <span className="text-red-950 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={program}
                          onChange={handleProgramChange}
                          className={`w-full p-4 pl-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300 appearance-none ${
                            validationErrors.program ? 'border-red-500' : 'border-gray-200 focus:border-green-900'
                          }`}
                          required
                        >
                          <option value="">Select Your Program</option>
                          <option>Business Administration</option>
                          <option>Computer Science</option>
                          <option>Information Technology</option>
                          <option>Psychology</option>
                          <option>Accounting</option>
                          <option>Economics</option>
                          <option>Marketing</option>
                          <option>Human Resource Management</option>
                          <option>Banking and Finance</option>
                          <option>Theology</option>
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaGraduationCap className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      {validationErrors.program && (
                        <p className="text-xs text-red-600 flex items-center mt-1">
                          <FaExclamationTriangle className="w-3 h-3 mr-1" /> {validationErrors.program}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Graduation Year (Students only) */}
                  {role === "student" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 block">
                        Expected Graduation Year <span className="text-red-950 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={graduationYear}
                          onChange={handleGraduationYearChange}
                          className={`w-full p-4 pl-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300 ${
                            validationErrors.graduationYear ? 'border-red-500' : 'border-gray-200 focus:border-green-900'
                          }`}
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaCalendarAlt className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      {validationErrors.graduationYear && (
                        <p className="text-xs text-red-600 flex items-center mt-1">
                          <FaExclamationTriangle className="w-3 h-3 mr-1" /> {validationErrors.graduationYear}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Phone Number <span className="text-red-950 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="Enter your phone number (e.g., +233 XX XXX XXXX or 024XXXXXXX)"
                        value={phone}
                        onChange={handlePhoneChange}
                        className={`w-full p-4 pl-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300 ${
                          validationErrors.phone ? 'border-red-500' : 'border-gray-200 focus:border-green-900'
                        }`}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaPhone className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    {validationErrors.phone && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <FaExclamationTriangle className="w-3 h-3 mr-1" /> {validationErrors.phone}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Format: Numbers, +, -, spaces, and parentheses (10-15 digits)</p>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Password <span className="text-red-950 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={handlePasswordChange}
                        className={`w-full p-4 pl-12 pr-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300 ${
                          validationErrors.password ? 'border-red-500' : 'border-gray-200 focus:border-green-900'
                        }`}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="w-5 h-5 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? <FaEyeSlash className="w-5 h-5 text-gray-400" /> : <FaEye className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                    {password && (
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${passwordStrength.color} mt-1`}>
                        Password Strength: {passwordStrength.text}
                      </div>
                    )}
                    {validationErrors.password && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <FaExclamationTriangle className="w-3 h-3 mr-1" /> {validationErrors.password}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Requirements: Min 8 chars, uppercase, lowercase, number & special character (!@#$%^&*)
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Confirm Password <span className="text-red-950 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className={`w-full p-4 pl-12 pr-12 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 transition-all duration-300 ${
                          validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-green-900'
                        }`}
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="w-5 h-5 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showConfirmPassword ? <FaEyeSlash className="w-5 h-5 text-gray-400" /> : <FaEye className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-xs text-red-600 flex items-center mt-1">
                        <FaExclamationTriangle className="w-3 h-3 mr-1" /> {validationErrors.confirmPassword}
                      </p>
                    )}
                    {confirmPassword && password && !validationErrors.confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-green-600">✓ Passwords match</p>
                    )}
                  </div>

                  {/* Messages */}
                  {errorMsg && (
                    <div className="p-4 bg-red-50/80 border border-red-900/20 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <FaExclamationTriangle className="text-red-900 flex-shrink-0 w-5 h-5" />
                        <span className="text-sm font-medium text-red-900">{errorMsg}</span>
                      </div>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-4 bg-green-50/80 border border-green-900/20 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <FaCheckCircle className="text-green-900 flex-shrink-0 w-5 h-5" />
                        <div>
                          <span className="text-sm font-medium text-green-900 block">{successMsg}</span>
                          <span className="text-xs text-green-700 block mt-1">Redirecting to login...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-green-950 to-green-800 hover:from-green-800 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium">Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <span className="font-medium">Create Account</span>
                        <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </button>
                </form>

                {/* Sign In Link */}
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{" "}
                    <button
                      onClick={() => navigate("/")}
                      className="text-green-900 hover:text-green-800 font-semibold underline transition-colors duration-300"
                    >
                      Sign In Here
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Branding */}
            <div className="flex-1 hidden lg:flex relative overflow-hidden">
              <img
                src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440610/Regent-University-College-of-Science-and-Technology-Mallam-Ghana-SchoolFinder-TortoisePathcom_himnme.jpg"
                alt="Regent University Campus"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
                  <p className="text-white/90">Start your career journey today</p>
                </div>
              </div>
              <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                <img
                  src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
                  alt="Regent University Badge"
                  className="w-16 h-16"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;