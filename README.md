# SimpleGrid.js

### Draft version, not finished

## Usage:

**HTML**
```html
<div class="js-simpleGrid">
	<!-- Optional, only if Add accion is allowed (see options) -->
	<button type="button" class="sg-add">Add</button>
	<table class="sg-table">
		<thead>
			<tr>
				<!-- Column per property -->
				<th>Sku</th>
				<th>Product</th>
				<th>Quantity</th>
				<th>Price</th>
				<th>Total</th>
				<!-- Last column for edit/delete/cancel/save btn -->
				<th style="width: 75px;"></th>
			</tr>
		</thead>
		<tbody>
			<!-- Always add empty row -->
			<tr class="sg-empty-row">
				<td colspan="6">No items to display</td>
			</tr>
		</tbody>
	</table>
	<!-- Save data in JSON format -->
	<textarea name="" class="sg-textarea"></textarea>
	<!-- Optional, only if Sorting is allowed (see options) -->
	<button type="button" class="sg-order">Save Order</button>
</div>
```

** JS & CSS **

```html
<html>
	<head>
		<link rel="stylesheet" href="/path/to/css/simpleGrid.css" media="screen" charset="utf-8">
	</head>
	<body>
		<!-- HTML -->
		<script src="/path/to/js/simpleGrid.js"></script>
		<script>
			new simpleGrid({
				headers: ['sku', 'product', 'quantity', 'price', 'total']
			});
		</script>
	</body>
</html>
```
### Sorting:
Require: tableDnD

## Options:

```javascript
new simpleGrid({
	selector: ".js-simpleGrid",
	emptyText: "Nada :(",
	removeText: 'Are you sure you want to delete this row?',
	icons: {
		edit: '',
		remove: '',
		cancel: '',
		save: ''
	},
	oddClass: 'sg-odd',
	evenClass: 'sg-even',
	headers: [],
	allowEmpty: true,
	actions: {
		add: true,
		edit: true,
		remove: true
	},
	columns: {},
	sorting: true
})
```
`icons`
URL to icon image. **NOW** only accept images, not icon fonts or svg.

```html
// js
...
icons: {
	edit: '/path/to/edit-icon.png'
}
...
// html
<img src="/path/to/edit-icon.png" alt="Edit">
```
`columns`
Define column type and format display value.
Opcions:
* type
	* number
* format
	* `#.#,## c` Original: 1000,503 Format: 1.000,50 €
	* `#.` Original: 100,20 Format: 100
* currency
	* €/$/...

```html
// js
...
columns: {
	price: {
		type: 'number',
		format: '#.## c',
		currency: '€'
	}
}
...
// generate
<td class="sg-col sg-col4" data-label="price">10.00 €</td>
```

## TODO
* Use another library to Sort Rows (without jQuery Dependency)
* Allow icons font when generate icons
* Add more columns formats if its necessary
* Generate all table DOM elements (thead and tbody)
