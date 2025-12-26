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
    {'name': 'Chicken Dim Sum', 'category': 'Dim Sums', 'price_full': 10, 'price_half': 70},
    {'name': 'Veg Dim Sum', 'category': 'Dim Sums', 'price_full': 110, 'price_half': 65},
    {'name': 'Prawn Dim Sum', 'category': 'Dim Sums', 'price_full': 140, 'price_half': 80},
    {'name': 'Pork Dim Sum', 'category': 'Dim Sums', 'price_full': 130, 'price_half': 75},
    {'name': 'Beef Dim Sum', 'category': 'Dim Sums', 'price_full': 135, 'price_half': 80},
    {'name': 'Mushroom Dim Sum', 'category': 'Dim Sums', 'price_full': 115, 'price_half': 70},
    {'name': 'Shrimp Dim Sum', 'category': 'Dim Sums', 'price_full': 145, 'price_half': 85},
    {'name': 'Crab Dim Sum', 'category': 'Dim Sums', 'price_full': 150, 'price_half': 90},
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

