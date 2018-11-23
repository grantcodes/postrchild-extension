import { EditorState, AtomicBlockUtils } from "draft-js";
import micropub from "../../../modules/micropub";

export default (onChange, editorState, file) => {
  console.log(file);
  let urlType = null;
  if (file.type.startsWith("image/")) {
    urlType = "IMAGE";
  } else if (file.type.startsWith("video/")) {
    urlType = "VIDEO";
  } else {
    // TODO: Maybe should still upload the file anyway and create a link instead of a image or video
    return alert("Sorry, can't handle that sort of file at the moment");
  }

  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity(
    urlType,
    "IMMUTABLE",
    { style: { opacity: 0.6 }, src: URL.createObjectURL(file) }
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = AtomicBlockUtils.insertAtomicBlock(
    editorState,
    entityKey,
    " "
  );

  micropub
    .postMedia(file)
    .then(fileUrl => {
      console.log("File uploaded to", fileUrl);
      editorState
        .getCurrentContent()
        .mergeEntityData(entityKey, { src: fileUrl, style: {} });
    })
    .catch(err => {
      console.log("Error uploading file", err);
      alert("Error uploading file to media endpoint");
    });

  onChange(
    EditorState.forceSelection(
      newEditorState,
      newEditorState.getCurrentContent().getSelectionAfter()
    )
  );
};
