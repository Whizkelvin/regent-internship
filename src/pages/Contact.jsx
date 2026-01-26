import React, { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  User,
  X,
  Info,
  MailCheck,
  Database,
  RefreshCw
} from "lucide-react";
import { supabase } from "../supabaseClient";

const Contact = () => {
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    title: "",
    message: "",
    details: [],
    type: "success" // or "error"
  });
  
  const formRef = useRef(null);

  // Replace with YOUR email address
  const YOUR_EMAIL = "jasonagyeman060@gmail.com"; 

  // Check if user is logged in
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setUserEmail(user.email);
      
      // Try to get user's name from metadata or profile
      const name = user.user_metadata?.name || 
                   user.user_metadata?.full_name || 
                   user.email?.split('@')[0];
      setUserName(name);
      
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        name: name || "",
        email: user.email || ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Clear all form inputs
  const clearForm = () => {
    setFormData({
      name: user ? userName : "",
      email: user ? userEmail : "",
      phone: "",
      subject: "",
      message: "",
    });
    setErrors({});
    
    // Also reset form validation state
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    clearForm();
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // =======================
      // 1. SEND EMAIL TO YOURSELF USING FORMSUBMIT.CO
      // =======================
      const emailResponse = await fetch(`https://formsubmit.co/ajax/${YOUR_EMAIL}`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone?.trim() || 'Not provided',
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          
          // FormSubmit.co options
          _subject: `Contact Form: ${formData.subject}`,
          _template: "table",
          _captcha: "false",
        })
      });
      
      if (!emailResponse.ok) {
        throw new Error(`HTTP error! status: ${emailResponse.status}`);
      }
      
      const emailResult = await emailResponse.json();
      
      // FormSubmit.co returns success as string "true" or "false"
      if (emailResult.success !== "true") {
        const errorMsg = emailResult.message || 
                        emailResult.error || 
                        "FormSubmit.co returned false";
        throw new Error(`Email service error: ${errorMsg}`);
      }

      // =======================
      // 2. SAVE TO SUPABASE DATABASE (Optional backup)
      // =======================
      let dbSuccess = false;
      try {
        const { error: dbError } = await supabase
          .from('contact_messages')
          .insert([
            {
              name: formData.name.trim(),
              email: formData.email.trim().toLowerCase(),
              phone: formData.phone?.trim() || null,
              subject: formData.subject.trim(),
              message: formData.message.trim(),
              created_at: new Date().toISOString()
            }
          ]);

        if (dbError) {
          console.warn("Failed to save to database:", dbError);
        } else {
          dbSuccess = true;
        }
      } catch (dbError) {
        console.warn("Database save failed:", dbError);
      }

      // =======================
      // 3. SHOW SUCCESS MODAL AND CLEAR FORM
      // =======================
      setSubmitStatus({
        title: "Message Sent Successfully! 🎉",
        message: "Thank you for contacting Regent Hub. We've received your message and will respond soon.",
        details: [
          { icon: "✓", text: `Email sent to ${YOUR_EMAIL}` },
          { icon: "✓", text: `Auto-reply sent to ${formData.email}` },
          { icon: dbSuccess ? "✓" : "⚠", text: dbSuccess ? "Message saved in database" : "Message not saved in database" },
          { icon: "⏱", text: "Response time: Within 24 hours" }
        ],
        type: "success"
      });
      
      // Clear all form inputs
      clearForm();
      
      // Show success modal
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Error submitting form:", error);
      
      // =======================
      // 4. SHOW ERROR MODAL
      // =======================
      let errorMessage = "We couldn't send your message.";
      let errorDetails = "Please try again in a few moments.";
      
      if (error.message.includes("FormSubmit.co")) {
        errorMessage = "Email service unavailable";
        errorDetails = "Our email service is temporarily down. Please try again later.";
      } else if (error.message.includes("HTTP error")) {
        errorMessage = "Network error";
        errorDetails = "Please check your internet connection and try again.";
      } else if (error.message.includes("captcha")) {
        errorMessage = "Security check failed";
        errorDetails = "Please refresh the page and try submitting again.";
      }
      
      setSubmitStatus({
        title: errorMessage,
        message: errorDetails,
        details: [
          { icon: "❌", text: "Email not sent" },
          { icon: "⚠", text: "Form data not saved" },
          { icon: "💡", text: "Try using a different browser" },
          { icon: "📧", text: `You can email us directly at ${YOUR_EMAIL}` }
        ],
        type: "error"
      });
      
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      details: "+233 50 132 1208 / 54 574 7320",
      subtitle: "Mon-Fri from 9am to 6pm",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      details: "regenthub@regent.edu.gh",
      subtitle: "We reply within 24 hours",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Office",
      details: "regent hub, Regent University",
      subtitle: "MensKrom - Accra",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      details: "Monday - Friday",
      subtitle: "9:00 AM - 6:00 PM EST",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600">
            Have questions? We'd love to hear from you.
          </p>
          
          {/* User Info Badge */}
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">
                Sending as: {userEmail}
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            {contactInfo.map((item, index) => (
              <div 
                key={index}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <div className="text-blue-600">
                      {item.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-900 font-medium">
                      {item.details}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a message
              </h2>
              
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={!!user}
                      className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none ${
                        user ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      placeholder="john@example.com"
                    />
                    {user && (
                      <p className="text-xs text-gray-500 mt-1">
                        Using your account email
                      </p>
                    )}
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                    placeholder="+233 24 123-4567"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                    placeholder="How can we help you?"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                  )}
                </div>
                
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    required
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-600">
                    I agree to the processing of my data. Your information will only be used to respond to your inquiry.
                  </label>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-green-800 to-green-700 text-white px-6 py-3 rounded-xl font-medium hover:from-green-900 hover:to-green-800 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={clearForm}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
                    title="Clear form"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">How our contact form works</h4>
              <p className="text-blue-700 text-sm">
                Your message is sent directly to our team via email and also saved in our secure database. 
                You'll receive an automatic confirmation email to the address you provide.
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowSuccessModal(false)}
            ></div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {submitStatus.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {submitStatus.message}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-gray-900">What happened:</h4>
                  {submitStatus.details.map((detail, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-green-600 font-bold">{detail.icon}</span>
                      <span className="text-gray-700">{detail.text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <MailCheck className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-green-800 text-sm font-medium">
                        Check your email inbox
                      </p>
                      <p className="text-green-700 text-sm">
                        You should receive a confirmation email shortly. Please check your spam folder if you don't see it.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-3 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Send Another Message
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowErrorModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4 sm:p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 p-3 rounded-full">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {submitStatus.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {submitStatus.message}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowErrorModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-gray-900">Troubleshooting steps:</h4>
                  {submitStatus.details.map((detail, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-red-600 font-bold">{detail.icon}</span>
                      <span className="text-gray-700">{detail.text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-red-800 text-sm font-medium">
                        Contact us directly
                      </p>
                      <p className="text-red-700 text-sm">
                        You can email us directly at {YOUR_EMAIL} or call us at +233 50 132 1208.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-3 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => setShowErrorModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;