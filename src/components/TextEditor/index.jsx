import React from "react";
import { useState } from "react";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "draft-js/dist/Draft.css";
import { Editor } from "react-draft-wysiwyg";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";

function TextEditor(props) {
  const { editorState, handleEditorChange } = props;

  return (
    <>
      <div className="editor bg-[#f9f8fa] min-h-screen pb-16">
        <Editor
          editorState={editorState}
          onEditorStateChange={handleEditorChange}
          toolbarClassName="flex sticky top-0 z-50 mx-auto !border-0 !border-b-2 !border-[#ccc] shadow-md"
          editorClassName="mt-6 bg-white p-5 shadow-lg min-h-[1300px] max-w-5xl mx-auto mb-12 border-2 rounded-sm border-gray-300"
        />
      </div>
    </>
  );
}

export default TextEditor;
