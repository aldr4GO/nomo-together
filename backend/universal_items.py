"""
Universal list of items that can be added to the menu.
This is a master list of all possible items the stall can offer.
"""

UNIVERSAL_ITEMS = [
    # Normal Momos
    {'name': 'Veg Maida Momos', 'category': 'Normal Momos', 'price_full': 200, 'price_half': 150},
    {'name': 'Paneer Maida Momos', 'category': 'Normal Momos', 'price_full': 200, 'price_half': 150},
    {'name': 'Chicken Maida Momos', 'category': 'Normal Momos', 'price_full': 200, 'price_half': 150},
    
    # Healthy Momos
    {'name': 'Veg Ragi Momos', 'category': 'Healthy Momos', 'price_full': 250, 'price_half': 180},
    {'name': 'Veg Oats Momos', 'category': 'Healthy Momos', 'price_full': 250, 'price_half': 180},
    {'name': 'Paneer Ragi Momos', 'category': 'Healthy Momos', 'price_full': 250, 'price_half': 180},
    {'name': 'Paneer Oats Momos', 'category': 'Healthy Momos', 'price_full': 250, 'price_half': 180},
    {'name': 'Chicken Ragi Momos', 'category': 'Healthy Momos', 'price_full': 250, 'price_half': 180},
    {'name': 'Chicken Oats Momos', 'category': 'Healthy Momos', 'price_full': 250, 'price_half': 180},
    
    # Dim Sums
    {'name': 'Spinach Cheese Corn', 'category': 'Dim Sums', 'price_full': 300, 'price_half': 210},
    {'name': 'Mushroom cheese', 'category': 'Dim Sums', 'price_full': 300, 'price_half': 210},
    {'name': 'Chicken Lemon', 'category': 'Dim Sums', 'price_full': 300, 'price_half': 210},
    {'name': 'Chicken Teriyaki', 'category': 'Dim Sums', 'price_full': 300, 'price_half': 210},
    {'name': 'Chicken Chilly Oil', 'category': 'Dim Sums', 'price_full': 300, 'price_half': 210}
]

def get_universal_items():
    """Get all universal items"""
    return UNIVERSAL_ITEMS

def get_universal_item_by_name(name):
    """Get a universal item by name"""
    for item in UNIVERSAL_ITEMS:
        if item['name'] == name:
            return item
    return None

