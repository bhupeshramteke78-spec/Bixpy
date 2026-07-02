const catalog={
  Chinese:[
    ['hakka-noodles','Hakka Noodles',140],['veg-fried-rice','Veg Fried Rice',140],['manchurian-rice-regular','Manchurian Rice',160],
    ['chilli-garlic-noodles','Chilli Garlic Noodles',140],['chona-chilli','Chona Chilli',140],['corn-roast','Corn Roast',150],
    ['corn-chilli-regular','Corn Chilli',160],['crispy-corn','Crispy Corn',160],['schezwan-noodles','Schezwan Noodles',160],
    ['schezwan-fried-rice','Schezwan Fried Rice',160],['veg-65','Veg 65',170],['lovely-corn','Lovely Corn',170],
    ['corn-chilli-special','Corn Chilli',170],['manchurian-dry','Manchurian Dry',160],['crispy-rice','Crispy Rice',170],
    ['paneer-chilli-dry','Paneer Chilli Dry',180],['chopper-rice','Chopper Rice',220],['manchurian-rice-special','Manchurian Rice',220],
  ],
  Beverages:[
    ['hot-coffee','Hot Coffee',30],['masala-cold-drink','Masala Cold Drink',60],['cold-coffee','Cold Coffee',120],
    ['virgin-mojito','Virgin Mojito',120],['watermelon-mojito','Watermelon Mojito',130],['blue-lagoon-mocktail','Blue Lagoon Mocktail',130],
    ['kit-kat-shake','Kit Kat Shake',130],['oreo-shake','Oreo Shake',140],['chocolate-shake','Chocolate Shake',140],
    ['cold-coffee-ice-cream','Cold Coffee With Ice Cream',140],['kit-kat-shake-ice-cream','Kit Kat Shake With Ice Cream',160],
    ['chocolate-shake-ice-cream','Chocolate Shake With Ice Cream',160],['oreo-shake-ice-cream','Oreo Shake With Ice Cream',160],
  ],
  Pizza:[
    ['cheese-corn-pizza','Cheese Corn Pizza',210],['mexican-pizza','Mexican Pizza',210],['veg-supreme-pizza','Veg Supreme Pizza',210],
    ['veg-delight-pizza','Veg Delight Pizza',210],['paneer-tikka-pizza','Paneer Tikka Pizza',280],['corn-bite-special-pizza','Corn Bite Special Pizza',280],
  ],
  'Mumbai Special Sigri Dosa':[
    ['plain-dosa','Plain Dosa',50],['butter-masala-dosa','Butter Masala Dosa',70],['onion-tomato-uttapam','Onion Tomato Uttapam',110],
    ['masala-uttapam','Masala Uttapam',110],['special-masala-dosa','Special Masala Dosa',120],['pav-bhaji-dosa','Pav Bhaji Dosa',130],
    ['paneer-chili-dosa','Paneer Chili Dosa',160],['jini-dosa','Jini Dosa',160],['golmal-dosa','Golmal Dosa',160],
    ['pizza-dosa','Pizza Dosa',180],['corn-bite-special-dosa','Corn Bite Special Dosa',190],['chef-special-dosa','Chef Special Dosa',230],
    ['matka-dosa','Matka Dosa',250],
  ],
  Sandwich:[
    ['veg-grilled-sandwich','Veg Grilled Sandwich',100],['cheese-corn-sandwich','Cheese Corn Sandwich',110],['mexican-sandwich','Mexican Sandwich',110],
    ['bombay-style-sandwich','Bombay Style Sandwich',110],['veg-cheese-grilled-sandwich','Veg Cheese Grilled Sandwich',120],
    ['chocolate-sandwich','Chocolate Sandwich',110],['paneer-tikka-sandwich','Paneer Tikka Sandwich',120],
  ],
  'Sweet Corn Cup':[
    ['sweet-corn-butter-salted','Sweet Corn Butter Salted',70],['sweet-corn-butter-masala','Sweet Corn Butter Masala',70],
    ['sweet-corn-cheese-corn','Sweet Corn Cheese Corn',90],['cheesy-sweet-corn','Cheesy Sweet Corn',90],['cheese-corn-balls','Cheese Corn Balls',180],
  ],
  'Pav Bhaji':[
    ['pav-bhaji','Pav Bhaji',110],['masala-pav-bhaji','Masala Pav Bhaji',120],['cheese-pav-bhaji','Cheese Pav Bhaji',130],
    ['paneer-pav-bhaji','Paneer Pav Bhaji',130],['khada-pav-bhaji','Khada Pav Bhaji',120],['extra-pav','Extra Pav',30],['extra-bhaji','Extra Bhaji',70],
  ],
  Fries:[
    ['plain-fries','Plain Fries',100],['masala-fries','Masala Fries',120],['peri-peri-fries','Peri Peri Fries',130],['mg-cheese-baked-nachos','M/G Cheese Baked Nachos',180],
  ],
  Burgers:[
    ['veg-cheese-burger','Veg Cheese Burger',120],['paneer-cheese-burger','Paneer and Cheese Burger',140],['corn-cheese-burger','Corn Cheese Burger',140],
  ],
}

export const orderCategories=Object.keys(catalog)
export const orderMenuItems=orderCategories.flatMap(category=>catalog[category].map(([id,name,price])=>({
  id,
  name,
  price,
  category,
  image:`/images/order/${id}.webp`,
})))
