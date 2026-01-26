import React, { useState } from 'react';
import { FaTimes, FaPaperPlane } from 'react-icons/fa';

const MessageModal = ({
  showMessageModal,
  setShowMessageModal,
  selectedApplication,
  message,
  setMessage,
  sendingMessage,
  sendMessageToApplicant
}) => {
  if (!showMessageModal || !selectedApplication) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-900 to-pink-800 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Send Message</h3>
              <p className="text-purple-200 text-sm mt-1">
                To: {selectedApplication.full_name || selectedApplication.email}
              </p>
            </div>
            <button
              onClick={() => setShowMessageModal(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="6"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 resize-none"
              placeholder="Type your message here..."
              onKeyDown={(e) => e.stopPropagation()}
            />
            <p className="text-xs text-gray-500 mt-2">
              This message will be sent to the applicant's email and stored in their application history.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowMessageModal(false)}
              className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={sendMessageToApplicant}
              disabled={!message.trim() || sendingMessage}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingMessage ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;