const express = require('express')
const multer = require('multer')
const { Router }  = express

const productos = Router()
const dirFiles = 'Uploads'

const persistenciaProductos = []
let productoAdd = {}

/**
 * Function/Middleware encargada de verificar la 
 * existencia de datos el array 
 */ 
const verifyContent = (req, res, next) => {
    if (persistenciaProductos.length == 0) {
        res.status(200).json({message: 'Sin datos'})
        return
    }
    next()
}

/**
 * Function/Middleware encargado de verificar 
 * si se enviaron todos los datos y tipos correctos
*/
const verifyData = (req, res, next) => {
    const { title, price } = req.body
    const file  = req.file
    if (!title) {
        // res.status(400).json({message:'Error en campo title'})
        const error = new Error('Completar campo title')
        error.statusCode = 400
        throw error
    }
    /*Verificacion de tipo */
    if (!isNaN(title)){
        const error = new Error('Campo title debe ser string')
        error.statusCode = 400
        throw error
    }
    
    if (!price) {
        const error = new Error('Completar campo price')
        error.statusCode = 400
        throw error
    }
    /*Verificacion de tipo */
    if (isNaN(price)) {
        const error = new Error('Campo price debe ser number')
        error.statusCode = 400
        throw error
    }
    
    if (!file) {
        const error = new Error('Archivo no cargado')
        error.statusCode = 400
        throw error
        return
    }
    productoAdd = {...req.body}
    productoAdd.thumbnail = file.path
    next()
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dirFiles)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({storage: storage})

productos.post('/productos', upload.single('my-file'), verifyData, (req, res) => {
    if (!persistenciaProductos.length) {
        productoAdd.id = 1
    }else{
        const id =  persistenciaProductos[persistenciaProductos.length - 1].id + 1
        productoAdd.id = id
    }
    persistenciaProductos.push(productoAdd)
    res.status(201).send(productoAdd)
})

productos.get('/productos', verifyContent, (req, res) => {
    res.status(200).send(persistenciaProductos)
})

productos.get('/productos/:id', verifyContent, (req, res) => {
    const { id } = req.params
    const product = persistenciaProductos.find((element) => element.id == id)
    if (!product) {
        res.status(404).json({error: 'Producto no encontrado'})
        return
    }
    res.status(200).send(product)
})

productos.put('/productos/:id',  upload.single('my-file'), verifyContent, verifyData, (req, res) => {
    const { id } = req.params
    let product = persistenciaProductos.find((element) => element.id == id)
    if (!product) {
        res.status(404).json({error: 'Producto no encontrado'})
        return
    }    

    const indexByProduct = persistenciaProductos.findIndex(element => element.id == id) 
    if (indexByProduct == -1) {
        res.status(404).json({error: 'Producto no encontrado'})
        return
    }

    const putProduct = {...product, ...productoAdd }
    persistenciaProductos[indexByProduct] = putProduct
    res.sendStatus(200)

})

productos.delete('/productos/:id',  verifyContent, (req, res) => {
    const { id } = req.params
    const indexByProduct = persistenciaProductos.findIndex((element) => element.id == id)
    if (indexByProduct == -1) {
        res.status(404).json({error: "Producto no encontrado"})
        return
    }

    persistenciaProductos.splice(indexByProduct, 1)
    res.sendStatus(204)
})


module.exports = { productos }