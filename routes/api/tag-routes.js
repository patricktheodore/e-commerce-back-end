const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

router.get('/', async (req, res) => {
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product, through: ProductTag, as: 'products' }]
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err)
  }

});

router.get('/:id', async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag, as: 'products' }]
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err)
  }
});

router.post('/', (req, res) => {
  Tag.create(req.body)
    .then((tag) => {
      if (req.body.productIds) {
        const productTags = req.body.productIds.map((product_id) => {
          return {
            tag_id: tag.id,
            product_id,
          };
        });
        return ProductTag.bulkCreate(productTags)
      }
      res.status(201).json(tag);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});


router.put('/:id', (req, res) => {
  // find out the current products
  Tag.findByPk(req.params.id, {
    include: [{ model: Product, through: ProductTag, as: 'products' }]
  }).then((tags) => {

    // get all the product ids 
    const productIds = tags.products.map(product => product.id);

    // remove the relationships
    return ProductTag.destroy({
      where: {
        product_id: productIds,
        tag_id: req.params.id
      }
    })

  }).then(result => {
    // insert the new sets of tag ids

    // prepare an array of 
    // {product_id, tag_id}
    const payload = req.body.productIds.map(productId => {
      return {
        product_id: productId,
        tag_id: req.params.id
      }
    })
    return ProductTag.bulkCreate(payload);

  }).then((result) => {
    res.json(result)
  }).catch((err) => {
    res.status(400).json(err);
  });
});



router.delete('/:id', async (req, res) => {
  try {
    const tagData = await Tag.destroy({
      where: {
        id:req.params.id
      }
    });
    if (!tagData) {
      res.status(400).json({ message: "No Tag with this ID!"});
      return
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(400).json(err)
  }
});

module.exports = router;
