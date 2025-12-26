import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState([]);
  const [universalItems, setUniversalItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current'); // current or add
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [menuData, universalData] = await Promise.all([
        adminAPI.getMenuItems(),
        adminAPI.getUniversalItems(),
      ]);
      setMenuItems(menuData);
      setUniversalItems(universalData);
    } catch (error) {
      console.error('Error loading menu data:', error);
      setError(error.message || 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      setError(null);
      await adminAPI.updateMenuItem(itemId, {
        is_available: !currentStatus,
      });
      await loadData();
      setSuccess(`Item ${!currentStatus ? 'added to' : 'removed from'} menu`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating item:', error);
      setError(error.message || 'Failed to update item');
    }
  };

  const handleAddFromUniversal = async (itemName) => {
    try {
      setError(null);
      await adminAPI.addMenuItem({ name: itemName });
      await loadData();
      setSuccess('Item added to menu successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error adding item:', error);
      setError(error.message || 'Failed to add item');
    }
  };

  // Group menu items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Group universal items by category
  const universalByCategory = universalItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'current'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Current Menu ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'add'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Add Items
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Current Menu Tab */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {Object.keys(menuByCategory).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No items in menu</p>
            </div>
          ) : (
            Object.keys(menuByCategory).map((category) => (
              <div key={category} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{category}</h3>
                <div className="space-y-3">
                  {menuByCategory[category].map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 ${
                        item.is_available
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            {item.is_available ? (
                              <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">
                                Available
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            Full: ₹{item.price_full} | Half: ₹{item.price_half}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleAvailability(item.id, item.is_available)}
                          className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium ${
                            item.is_available
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {item.is_available ? 'Mark Out of Stock' : 'Mark Available'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Items Tab */}
      {activeTab === 'add' && (
        <div className="space-y-6">
          {Object.keys(universalByCategory).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No universal items available</p>
            </div>
          ) : (
            Object.keys(universalByCategory).map((category) => (
              <div key={category} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{category}</h3>
                <div className="space-y-3">
                  {universalByCategory[category].map((item) => (
                    <div
                      key={item.name}
                      className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            {item.in_menu && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                In Menu
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            Full: ₹{item.price_full} | Half: ₹{item.price_half}
                          </div>
                        </div>
                        {!item.in_menu && (
                          <button
                            onClick={() => handleAddFromUniversal(item.name)}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                          >
                            Add to Menu
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

