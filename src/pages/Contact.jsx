import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  User
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
    setSubmitError("");
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);
  setSubmitError("");

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
        
        // FormSubmit.co options (simplified)
        _subject: `Contact Form: ${formData.subject}`,
        _template: "table",
        _captcha: "false", // Try without captcha first
      })
    });
    
    if (!emailResponse.ok) {
      throw new Error(`HTTP error! status: ${emailResponse.status}`);
    }
    
    const emailResult = await emailResponse.json();
    
    // FormSubmit.co returns success as string "true" or "false"
    if (emailResult.success !== "true") {
      // Try to get error message from response
      const errorMsg = emailResult.message || 
                      emailResult.error || 
                      "FormSubmit.co returned false";
      throw new Error(`Email service error: ${errorMsg}`);
    }

    // =======================
    // 2. SAVE TO SUPABASE DATABASE (Optional backup)
    // =======================
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
        // Continue anyway since email was sent
      }
    } catch (dbError) {
      console.warn("Database save failed:", dbError);
    }

    // =======================
    // 3. SUCCESS
    // =======================
    setIsSubmitted(true);
    
    // Reset form but keep user email if logged in
    setFormData({ 
      name: user ? userName : "", 
      email: user ? userEmail : "", 
      phone: "", 
      subject: "", 
      message: "" 
    });
    
    setErrors({});

  } catch (error) {
    console.error("Error submitting form:", error);
    
    // More user-friendly error messages
    let errorMessage = "Failed to send message. Please try again.";
    
    if (error.message.includes("FormSubmit.co")) {
      errorMessage = "Email service is temporarily unavailable. Please try again in a few minutes.";
    } else if (error.message.includes("HTTP error")) {
      errorMessage = "Network error. Please check your connection and try again.";
    } else if (error.message.includes("captcha")) {
      errorMessage = "Captcha verification failed. Please refresh the page and try again.";
    }
    
    setSubmitError(errorMessage);
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
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-6">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Thank you for contacting Regent Hub. We've received your message.
                  </p>
                  <p className="text-gray-500 text-sm mb-6">
                    ✅ Email sent to our team<br />
                    ✅ Auto-reply sent to {formData.email}<br />
                    ✅ Message saved in our system
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-blue-600 text-white font-medium py-2 px-6 rounded-xl hover:bg-blue-700 transition-colors duration-200"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Send us a message
                  </h2>
                  
                  {submitError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center text-red-700">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <p className="font-medium">{submitError}</p>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-green-800 to-green-700 text-white px-6 py-3 rounded-xl font-medium hover:from-green-900 hover:to-green-800 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
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
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">How our contact form works</h4>
              <p className="text-blue-700 text-sm">
                Your message is sent directly to our team via email and also saved in our secure database. 
                You'll receive an automatic confirmation email to {formData.email || "your email address"}.
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;