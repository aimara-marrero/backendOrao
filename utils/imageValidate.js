const imageValidate = (images) => {
    let imagesTable = []
    if(Array.isArray(images)) {
        imagesTable = images
    } else {
        imagesTable.push(images)
    }

    if(imagesTable.length > 3) {
        return { error: "Envía solo 3 imágenes al mismo tiempo" }
    }
    for(let image of imagesTable) {
        if(image.size > 1048576) return { error: "El tamaño es muy grande (como max. 1 MB)" }

        const filetypes = /jpg|jpeg|png|svg/
        const mimetype = filetypes.test(image.mimetype)
        if(!mimetype) return { error: "Incorrect mime type (should be jpg,jpeg or png" }
    }

    return { error: false }
}

module.exports = imageValidate
