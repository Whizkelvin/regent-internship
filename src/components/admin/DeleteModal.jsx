import React from 'react';
import { FaTrash } from 'react-icons/fa';

const DeleteModal = ({ showDeleteModal, setShowDeleteModal, jobToDelete, handleDeleteJob }) => {
  if (!showDeleteModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <FaTrash className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
              <p className="text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete <span className="font-bold">"{jobToDelete?.title}"</span>?
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteJob}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
            >
              Delete Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;