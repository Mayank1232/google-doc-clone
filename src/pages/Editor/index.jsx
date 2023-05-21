import React, { useState } from "react";
import { convertToRaw, EditorState } from "draft-js";
import { Link } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import Button from "@material-tailwind/react/Button";
import TextEditor from "../../components/TextEditor";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

function Editor() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [documentName, setDocumentName] = useState("Untitled document");
  const [isEditing, setIsEditing] = useState(false);

  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const stopEditing = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setDocumentName(e.target.value);
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const getEditorContent = () => {
    const contentState = editorState.getCurrentContent();
    const contentRaw = convertToRaw(contentState);
    return JSON.stringify(contentRaw);
  };

  const downloadPDF = async () => {
    const docData = getEditorContent();
    const contentRaw = JSON.parse(docData);

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();

    const { width, height } = page.getSize();
    let y = height - 50;

    const blocks = contentRaw.blocks;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const textLines = block.text.split("\n");

      for (let j = 0; j < textLines.length; j++) {
        const lineText = textLines[j];
        const inlineStyles = block.inlineStyleRanges;

        let x = 50;
        let fontSize = 12;
        let isBold = false;
        let isUnderline = false;
        let isItalic = false;

        inlineStyles.forEach((style) => {
          console.log(style.style);
          if (style.offset <= j && style.offset + style.length >= j) {
            if (style.style.includes("BOLD")) {
              isBold = true;
            }
            if (style.style.includes("UNDERLINE")) {
              isUnderline = true;
            }
            if (style.style.includes("ITALIC")) {
              isItalic = true;
            }
            // Extract font size from style.style
            const fontSizeMatch = style.style.match(
              /(fontsize|fontSize)-(\d+)/
            );
            if (fontSizeMatch) {
              fontSize = parseInt(fontSizeMatch[2]);
            }
          }
        });

        let font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        let boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        let italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
        let boldItalicFont = await pdfDoc.embedFont(
          StandardFonts.HelveticaBoldOblique
        );

        if (isBold && isItalic) {
          font = boldItalicFont;
        } else if (isBold) {
          font = boldFont;
        } else if (isItalic) {
          font = italicFont;
        }

        const textOptions = {
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0), // Black color, modify as needed
          underline: isUnderline,
        };

        const words = lineText.split(" ");
        const lineWidth = words.reduce((width, word) => {
          return (
            width +
            textOptions.font.widthOfTextAtSize(word, fontSize) +
            textOptions.font.widthOfTextAtSize(" ", fontSize)
          );
        }, 0);

        // Calculate the width of the line including spaces
        const lineWidthWithSpaces = words.reduce((width, word) => {
          return (
            width +
            textOptions.font.widthOfTextAtSize(word, fontSize) +
            textOptions.font.widthOfTextAtSize(" ", fontSize)
          );
        }, 0);

        // Adjust starting position based on alignment
        if (block?.data?.["text-align"] === "center") {
          const centerOffset = (width - lineWidth) / 2;
          const lineHeight = fontSize * 1.2;
          const lineOffset =
            j === textLines.length - 1 ? 2 * lineHeight : lineHeight;
          x += centerOffset - lineWidth / 2;
          y -= lineHeight + lineOffset;
        } else if (block?.data?.["text-align"] === "right") {
          x += width - lineWidth;
        }

        let remainingHeight = y - fontSize;
        let remainingLines = textLines.length - j - 1;
        if (remainingLines > 0) {
          const lineHeight = fontSize * 1.2;
          const linesToWrite = Math.min(
            Math.floor(remainingHeight / lineHeight),
            remainingLines
          );
          y -= linesToWrite * lineHeight;
        }

        for (let k = 0; k < words.length; k++) {
          const word = words[k];
          const wordWidth = textOptions.font.widthOfTextAtSize(word, fontSize);

          if (x + wordWidth > width - 50) {
            y -= fontSize * 1.2;

            if (y < fontSize) {
              page = pdfDoc.addPage();
              y = height - 50;
            }

            x = 50;
          }

          const drawOptions = {
            x,
            y,
            font: textOptions.font,
            size: fontSize,
            color: textOptions.color,
          };

          if (isBold) {
            const boldFont = await pdfDoc.embedFont(
              StandardFonts.HelveticaBold
            );
            drawOptions.font = boldFont;
          }

          page.drawText(word, drawOptions);

          if (isUnderline) {
            const wordHeight = fontSize * 0.8;
            page.drawLine({
              start: { x, y: y + 2 },
              end: { x: x + wordWidth, y: y + 2 },
              thickness: 1,
              color: textOptions.color,
            });
          }

          x += wordWidth + textOptions.font.widthOfTextAtSize(" ", fontSize);
        }

        y -= fontSize * 1.2;

        if (y < fontSize) {
          page = pdfDoc.addPage();
          y = height - 50;
        }
      }
    }

    // Save the PDF as a Blob
    const pdfBytes = await pdfDoc.save();

    console.log(pdfBytes);

    // Trigger the download
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, `${documentName}.pdf`);
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
          <div className="flex-grow px-2 relative">
            {isEditing ? (
              <input
                type="text"
                className="text-2xl font-bold text-gray-500 outline-none bg-transparent border-b-2 border-gray-300 focus:border-blue-500 transition-colors duration-200"
                value={documentName}
                onChange={handleInputChange}
                onBlur={stopEditing}
                autoFocus
              />
            ) : (
              <h2
                className="text-2xl font-bold text-gray-500 cursor-pointer"
                onClick={startEditing}
              >
                {documentName}
              </h2>
            )}
            {isEditing && (
              <span className="absolute bottom-0 left-0 h-px bg-blue-500 w-full transition-transform duration-200 transform scale-x-0 group-hover:scale-x-100"></span>
            )}
          </div>
          <div className="z-10 flex items-center overflow-x-scroll text-sm space-x-1 ml-1 text-gray-600 relative">
            <p className="options">File</p>
            <p className="options">Edit</p>
            <p className="options">View</p>
            <p className="options">Insert</p>
            <p className="options">Format</p>
            <p className="options">Tools</p>
            <p className="options">Extensions</p>
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
          onClick={downloadPDF}
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
      </header>
      <TextEditor
        editorState={editorState}
        handleEditorChange={handleEditorChange}
      />
    </>
  );
}

export default Editor;
