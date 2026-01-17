// "use client";

// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

// export async function generatePedhinamaPDF(
//   elementId: string,
//   filename = "pedhinama.pdf"
// ) {
//     console.log("abcd",document.getElementById("pedhinama"));

//   const element = document.getElementById(elementId);
//   if (!element) {
//     alert("PDF element not found");
//     return;
//   }

//   console.log("xyz",document.getElementById("pedhinama"));

//   // Ensure fonts are loaded
//   await document.fonts.ready;

//   // Loader
//   const loader = document.createElement("div");
//   loader.innerText = "PDF બનાવી રહ્યા છીએ...";
//   loader.style.cssText = `
//     position:fixed;
//     inset:0;
//     background:rgba(0,0,0,0.6);
//     color:white;
//     display:flex;
//     align-items:center;
//     justify-content:center;
//     z-index:9999;
//     font-size:20px;
//   `;
//   document.body.appendChild(loader);

//   try {
//     const canvas = await html2canvas(element, {
//       // scale: 2,
//       useCORS: true,
//       // backgroundColor: "#ffffff",
//       // scrollY: -window.scrollY,
//     });

//     const imgData = canvas.toDataURL("image/png");

//     // Legal landscape
//     const pdf = new jsPDF("landscape", "mm", "legal");

//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = pdf.internal.pageSize.getHeight();

//     const imgWidth = pdfWidth;
//     const imgHeight = (canvas.height * pdfWidth) / canvas.width;

//     let heightLeft = imgHeight;
//     let position = 0;

//     pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//     heightLeft -= pdfHeight;

//     while (heightLeft > 0) {
//       position = heightLeft - imgHeight;
//       pdf.addPage();
//       pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//       heightLeft -= pdfHeight;
//     }

//     pdf.save(filename);
//   } catch (error) {
//     console.error(error);
//     alert("PDF બનાવવામાં ભૂલ આવી");
//   } finally {
//     document.body.removeChild(loader);
//   }
// }




"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePedhinamaPDF(
  elementId: string,
  filename = "pedhinama.pdf"
) {
  const source = document.getElementById(elementId);
  if (!source) {
    alert("PDF element not found");
    return;
  }

  await document.fonts.ready;

  // 🔥 CREATE ISOLATED CLONE (NO TAILWIND / NO LAB COLORS)
  const clone = source.cloneNode(true) as HTMLElement;

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-99999px";
  wrapper.style.top = "0";
  wrapper.style.background = "#ffffff";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // 🔥 FORCE RGB INLINE STYLES (IMPORTANT)
  const applySafeStyles = (original: HTMLElement, copied: HTMLElement) => {
    const style = window.getComputedStyle(original);

    copied.style.color = style.color;
    copied.style.backgroundColor = style.backgroundColor;
    copied.style.borderColor = style.borderColor;
    copied.style.fontFamily = style.fontFamily;

    const oChildren = Array.from(original.children);
    const cChildren = Array.from(copied.children);

    oChildren.forEach((child, i) => {
      if (
        child instanceof HTMLElement &&
        cChildren[i] instanceof HTMLElement
      ) {
        applySafeStyles(child, cChildren[i] as HTMLElement);
      }
    });
  };

  applySafeStyles(source, clone);

  try {
    const canvas = await html2canvas(clone, {
      background: "#ffffff",
      useCORS: true,
    } );

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "mm", "legal");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (err) {
    console.error(err);
    alert("PDF બનાવવામાં ભૂલ આવી");
  } finally {
    document.body.removeChild(wrapper);
  }
}
