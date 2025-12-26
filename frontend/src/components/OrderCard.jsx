import { useState } from 'react';

export default function OrderCard({ order, onUpdate, readOnly = false }) {
  const [updating, setUpdating] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePaymentStatusChange = async () => {
    if (readOnly) return;

    setUpdating(true);
    try {
      // Toggle payment status: if paid, set to pending; if pending, set to paid
      const newStatus = order.payment_status === 'paid' ? 'pending' : 'paid';
      await onUpdate(order.id, {
        payment_status: newStatus,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeliveryCheckbox = async (itemId, type, checked) => {
    if (readOnly) return;

    const item = order.items.find(i => i.id === itemId);
    if (!item) return;

    const updates = {
      items: [{
        id: itemId,
        [`delivered_${type}`]: checked ? item[`${type}_qty`] : 0,
      }],
    };

    setUpdating(true);
    try {
      await onUpdate(order.id, updates);
    } catch (error) {
      console.error('Error updating delivery:', error);
    } finally {
      setUpdating(false);
    }
  };

  const isFullyDelivered = order.items.every(item => 
    item.delivered_full >= item.full_qty && item.delivered_half >= item.half_qty
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm p-3 border-2 ${
      order.payment_status === 'paid' ? 'border-green-200' : 'border-yellow-200'
    }`}>
      {/* Main Row: Order # | Dishes | Amount */}
      <div className="flex items-start gap-3 mb-2">
        {/* Left: Order Number and Date */}
        <div className="flex-shrink-0">
          <h3 className="text-base font-bold text-gray-900">Order #{order.id}</h3>
          <p className="text-xs text-gray-600 mt-0.5">{formatDate(order.timestamp)}</p>
          {order.customer_name && (
            <p className="text-xs text-gray-700 mt-1 font-medium">{order.customer_name}</p>
          )}
          {order.customer_phone && (
            <p className="text-xs text-gray-600">{order.customer_phone}</p>
          )}
        </div>

        {/* Middle: Order Items - Horizontal Scrollable */}
        <div className="flex-1 min-w-0 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-1">
            {order.items.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-2 min-w-[240px] flex-shrink-0">
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="font-semibold text-gray-900 text-xs">{item.menu_item_name}</h4>
                  <div className="text-xs text-gray-600 whitespace-nowrap ml-2">
                    {item.full_qty > 0 && (
                      <span className="mr-1">{item.full_qty} Full</span>
                    )}
                    {item.half_qty > 0 && (
                      <span>{item.half_qty} Half</span>
                    )}
                  </div>
                </div>

                {/* Delivery Checkboxes */}
                {!readOnly && (
                  <div className="flex flex-col gap-1.5 mt-1.5">
                    {item.full_qty > 0 && (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.delivered_full >= item.full_qty}
                          onChange={(e) => handleDeliveryCheckbox(item.id, 'full', e.target.checked)}
                          disabled={updating}
                          className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                        />
                        <span className="text-xs text-gray-700">
                          Full ({item.delivered_full}/{item.full_qty})
                        </span>
                      </label>
                    )}
                    {item.half_qty > 0 && (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.delivered_half >= item.half_qty}
                          onChange={(e) => handleDeliveryCheckbox(item.id, 'half', e.target.checked)}
                          disabled={updating}
                          className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                        />
                        <span className="text-xs text-gray-700">
                          Half ({item.delivered_half}/{item.half_qty})
                        </span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Amount and Status */}
        <div className="flex-shrink-0 text-right">
          <p className="text-lg font-bold text-blue-600">₹{order.total_amount.toFixed(2)}</p>
          <div className="flex gap-1.5 mt-1 justify-end">
            <span className={`px-2 py-0.5 text-xs rounded ${
              order.payment_status === 'paid' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
            </span>
            <span className={`px-2 py-0.5 text-xs rounded ${
              order.order_status === 'served' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {order.order_status}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Payment Info and Actions */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-600">
            Payment: <strong className="text-gray-900">
              {order.payment_method === 'cash' ? '💵 Cash' : '📱 UPI'}
            </strong>
          </span>
          {order.payment_method === 'upi' && order.merchant_upi && (
            <span className="text-gray-600">
              UPI: <strong className="text-gray-900">{order.merchant_upi}</strong>
            </span>
          )}
        </div>

        {/* Actions */}
        {!readOnly && (
          <div className="flex gap-2">
            {(order.payment_status === 'pending' || order.payment_method === 'upi') && (
              <button
                onClick={handlePaymentStatusChange}
                disabled={updating}
                className={`
                  px-3 py-1 rounded-lg text-xs font-semibold transition
                  disabled:bg-gray-300 disabled:cursor-not-allowed
                  ${
                    order.payment_status === 'paid'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }
                `}
              >
                {updating
                  ? 'Updating...'
                  : order.payment_status === 'paid'
                  ? 'Mark as Unpaid'
                  : 'Mark as Paid'}
              </button>

            )}
            {isFullyDelivered && order.order_status !== 'served' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">
                All items delivered
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

