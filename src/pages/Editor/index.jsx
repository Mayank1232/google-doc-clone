import React, { useState } from "react";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { Link } from "@mui/material";
import Icon from "@material-tailwind/react/Icon";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import Button from "@material-tailwind/react/Button";
import TextEditor from "../../components/TextEditor";
import { saveAs } from "file-saver";
import { pdfMake } from "pdfmake/build/pdfmake";
import { pdfFonts } from "pdfmake/build/vfs_fonts";

function Editor() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const handleEditorChange = (newEditorState) => {
    console.log("New Editor State", newEditorState);
    setEditorState(newEditorState);
  };

  const getEditorContent = () => {
    const contentState = editorState.getCurrentContent();
    const contentRaw = convertToRaw(contentState);
    return JSON.stringify(contentRaw);
  };

  return (
    <>
      <header className="flex justify-between items-center p-3 pb-1">
        <span className="cursor-pointer">
          <Link to="/">
            <DescriptionIcon sx={{ fontSize: "49px" }} />
          </Link>
        </span>
        <div className="flex-grow px-2">
          <h2 className="">Mayank</h2>
          <div className="z-10 flex items-center overflow-x-scroll text-sm space-x-1 ml-1 text-gray-600 relative">
            <p className="options">File</p>
            <p className="options">Edit</p>
            <p className="options">View</p>
            <p className="options">Insert</p>
            <p className="options">Format</p>
            <p className="options">Tools</p>
            <p className="options">Add-ons</p>
            <p className="options">Help</p>
          </div>
        </div>
        <Button
          size="regular"
          style={{ background: "#1A73E8" }}
          className="!bg-[#1A73E8] hover:bg-blue-500 !rounded-md md:inline-flex h-10"
          rounded={false}
          block={false}
          iconOnly={false}
          ripple="light"
          onClick={() => {
            // Generate the doc file data or retrieve it from your TextEditor component
            const docData = getEditorContent();

            // Create a new Blob object with the file data and set the MIME type
            const blob = new Blob([docData], { type: "application/msword" });

            // Use the saveAs function from the file-saver library to trigger the download
            saveAs(blob, "document.doc");
          }}
        >
          <div
            className="me-5"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <DownloadIcon
              style={{ color: "white", fontSize: "20px", marginLeft: "10px" }}
            />
            <span style={{ color: "white", fontSize: "16px" }}>Download</span>
          </div>
        </Button>

        {/* <img
          src={user?.photoURL}
          alt={user?.displayName}
          title={user?.displayName}
          //   onClick={() => {
          //     signOut(auth);
          //     setUser(null);
          //   }}
          className="cursor-pointer rounded-full h-10 w-10 ml-2"
        /> */}
        {/* <img className="cursor-pointer rounded-full h-10 w-10 ml-2" src={doc} /> */}
      </header>
      <TextEditor
        editorState={editorState}
        handleEditorChange={handleEditorChange}
      />
    </>
  );
}

export default Editor;
