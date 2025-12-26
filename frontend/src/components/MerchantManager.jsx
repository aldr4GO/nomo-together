export default function MerchantManager({ merchants, onActivate }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Merchant UPI Accounts</h2>
      
      <div className="space-y-3">
        {merchants.length === 0 ? (
          <p className="text-gray-500 text-sm">No merchant accounts configured</p>
        ) : (
          merchants.map((merchant) => (
            <div
              key={merchant.id}
              className={`p-4 rounded-lg border-2 ${
                merchant.is_active
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{merchant.name}</h3>
                    {merchant.is_active && (
                      <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{merchant.upi_id}</p>
                </div>
                {!merchant.is_active && (
                  <button
                    onClick={() => onActivate(merchant.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Only one merchant account can be active at a time. New UPI orders will use the active account.
      </p>
    </div>
  );
}

