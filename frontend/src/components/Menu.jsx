import { useCart } from '../contexts/CartContext';

export default function Menu({ menu, disabled = false }) {
  const { addItem, removeItem, getQuantity } = useCart();

  // Group menu by category
  const menuByCategory = menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(menuByCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{category}</h2>
          <div className="space-y-4">
            {menuByCategory[category].map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                disabled={disabled}
                onAddFull={() => addItem(item.id, 'full')}
                onAddHalf={() => addItem(item.id, 'half')}
                onRemoveFull={() => removeItem(item.id, 'full')}
                onRemoveHalf={() => removeItem(item.id, 'half')}
                fullQty={getQuantity(item.id, 'full')}
                halfQty={getQuantity(item.id, 'half')}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuItemCard({ item, disabled, onAddFull, onAddHalf, onRemoveFull, onRemoveHalf, fullQty, halfQty }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <div className="mt-2 flex gap-4 text-sm text-gray-600">
            <span>Full: ₹{item.price_full}</span>
            <span>Half: ₹{item.price_half}</span>
          </div>
        </div>
        <div className="flex gap-4 ml-4">
          {/* Half */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[Menu] Half - button clicked:', { itemId: item.id, itemName: item.name, halfQty, disabled });
                  if (!disabled && halfQty > 0) {
                    console.log('[Menu] Calling onRemoveHalf for item:', item.id);
                    onRemoveHalf();
                  } else {
                    console.log('[Menu] Half - button not executing:', { disabled, halfQty });
                  }
                }}
                disabled={disabled || halfQty === 0}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
              >
                -
              </button>

              <span className="w-6 text-center text-sm font-medium text-gray-700">
                {halfQty}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[Menu] Half + button clicked:', { itemId: item.id, itemName: item.name, halfQty, disabled });
                  if (!disabled) {
                    console.log('[Menu] Calling onAddHalf for item:', item.id);
                    onAddHalf();
                  } else {
                    console.log('[Menu] Half + button not executing - disabled');
                  }
                }}
                disabled={disabled}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center disabled:opacity-50"
              >
                +
              </button>
            </div>
            <span className="text-xs text-gray-500">Half</span>
          </div>

          {/* Full */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[Menu] Full - button clicked:', { itemId: item.id, itemName: item.name, fullQty, disabled });
                  if (!disabled && fullQty > 0) {
                    console.log('[Menu] Calling onRemoveFull for item:', item.id);
                    onRemoveFull();
                  } else {
                    console.log('[Menu] Full - button not executing:', { disabled, fullQty });
                  }
                }}
                disabled={disabled || fullQty === 0}
                className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center disabled:opacity-50"
              >
                -
              </button>

              <span className="w-6 text-center text-sm font-medium text-gray-700">
                {fullQty}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[Menu] Full + button clicked:', { itemId: item.id, itemName: item.name, fullQty, disabled });
                  if (!disabled) {
                    console.log('[Menu] Calling onAddFull for item:', item.id);
                    onAddFull();
                  } else {
                    console.log('[Menu] Full + button not executing - disabled');
                  }
                }}
                disabled={disabled}
                className="w-8 h-8 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
              >
                +
              </button>
            </div>
            <span className="text-xs text-gray-500">Full</span>
          </div>
        </div>

      </div>
    </div>
  );
}

