import { Router } from "express";
import { productService, categoryService } from "../services";
import multer from "multer";

const productRouter = Router();


//////////////////////이미지 저장을 위한 코드//////////////////////
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`)
    }
});

const upload = multer({ storage: storage })
/////////////////////////////////////////////////////////////////

productRouter.get('/', async (req, res, next) => {
    let products = await productService.getProducts();
    let filteredProducts = [];
    const { lc, mc } = req.query;

    if (lc && mc) {
        filteredProducts = products.filter((product) => product.category_id.largeCategory === lc && product.category_id.mediumCategory === mc)
    } else if (lc && (mc === undefined)) {
        filteredProducts = products.filter((product) => product.category_id.largeCategory === lc)
    } else if ((lc === undefined) && mc) {
        filteredProducts = products.filter((product) => product.category_id.mediumCategory === mc)
    } else {
        filteredProducts = products;
    }

    console.log(filteredProducts);

    res.status(200).json(filteredProducts);
})


productRouter.get('/:id', async (req, res, next) => {
    const id = req.params.id;

    const product = await productRouter.getProductDetail(id);

    res.status(200).json(product)
})

//single 메소드의 인자인 'img'는 form의 필드중 name속성의 value이다.
productRouter.post('/register', upload.single('img'), async (req, res, next) => {

    const image = req.file.filename;
    //나중에 폼으로 대분류, 소분류 카테고리를 받아서 카테고리서비스를 통해 아이디를 가져와서 저장한다.
    const { name, price, description, brand, largeCategory, mediumCategory } = req.body
    const category = await categoryService.getSpecificCategory({ largeCategory, mediumCategory })
    const category_id = category._id;

    console.log(req.file);

    const product = await productService.addProduct({
        name,
        price,
        description,
        brand,
        category_id,
        image
    })

    res.status(200).json(product);
})

productRouter.patch('/:id', async (req, res, next) => {
    const id = req.params.id;
    const { name, price, description, madeBy, category_id } = req.body

    const updateProduct = await productService.updateProduct(id, {
        name,
        price,
        description,
        madeBy,
        category_id,
        image
    })

    res.status(200).json(updateProduct);
})

productRouter.delete('/:id', async (req, res, next) => {
    const id = req.params.id;

    const result = await productService.deleteProduct(id);

    res.status(200).json(result);
})


export { productRouter };