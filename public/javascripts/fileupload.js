FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
)

FilePond.setOptions({
    stylePanelAspectRatio: 150/100,
    imageResizeTargetHeight: 150,
    imageResizeTargetWidth: 100,
})

FilePond.parse(document.body);