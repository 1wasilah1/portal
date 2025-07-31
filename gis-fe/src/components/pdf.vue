<template>
  <div class="export-container">
    <button 
      @click="exportToPDF"
      :disabled="isExporting"
      class="export-pdf-button"
      :class="{ 'exporting': isExporting }"
    >
      <span v-if="!isExporting">
        <i class="fas fa-file-pdf"></i> Export to PDF
      </span>
      <span v-else>
        <i class="fas fa-spinner fa-spin"></i> Exporting...
      </span>
    </button>
  </div>
</template>


<script>
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default {
  name: 'MapExportButton',
  props: {
    // The ID or ref of the map container element
    mapContainerId: {
      type: String,
      required: true
    },
    // Optional PDF file name
    fileName: {
      type: String,
      default: 'map-export'
    },
    // Optional PDF title
    pdfTitle: {
      type: String,
      default: 'Map Export'
    }
  },
  data() {
    return {
      isExporting: false
    };
  },
  methods: {
    async exportToPDF() {
      this.isExporting = true;
      
      try {
        // Get the map container element
        const mapElement = document.getElementById(this.mapContainerId);
        
        if (!mapElement) {
          throw new Error('Map container element not found');
        }

        // Temporarily hide any controls or elements you don't want in the export
        this.hideNonMapElements();
        
        // Capture the map as an image
        const canvas = await html2canvas(mapElement, {
          scale: 2, // Higher scale for better quality
          useCORS: true, // Enable cross-origin images
          allowTaint: true, // Allow tainted canvas
          logging: false, // Disable logging
          backgroundColor: '#ffffff' // White background
        });

        // Restore hidden elements
        this.restoreNonMapElements();

        // Calculate dimensions for PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calculate PDF dimensions (maintain aspect ratio)
        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
        
        // Create PDF
        const pdf = new jsPDF({
          orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
          unit: 'mm'
        });
        
        // Add title if provided
        if (this.pdfTitle) {
          pdf.setFontSize(18);
          pdf.text(this.pdfTitle, pdfWidth / 2, 15, { align: 'center' });
        }
        
        // Add the image
        pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight - 20);
        
        // Add timestamp
        pdf.setFontSize(10);
        pdf.text(`Exported on: ${new Date().toLocaleString()}`, 10, pdfHeight - 5);
        
        // Save the PDF
        pdf.save(`${this.fileName}-${new Date().getTime()}.pdf`);
        
      } catch (error) {
        console.error('Error exporting to PDF:', error);
        this.$emit('export-error', error);
      } finally {
        this.isExporting = false;
      }
    },
    hideNonMapElements() {
      // Store elements that should be hidden during export
      this.hiddenElements = [];
      
      // Example: Hide all elements with class 'no-export'
      document.querySelectorAll('.no-export').forEach(el => {
        if (el.style.display !== 'none') {
          this.hiddenElements.push(el);
          el.style.display = 'none';
        }
      });
      
      // Example: Hide Leaflet controls if needed
      const controls = document.querySelectorAll('.leaflet-control-container');
      controls.forEach(el => {
        if (el.style.display !== 'none') {
          this.hiddenElements.push(el);
          el.style.display = 'none';
        }
      });
    },
    restoreNonMapElements() {
      // Restore all hidden elements
      if (this.hiddenElements) {
        this.hiddenElements.forEach(el => {
          el.style.display = '';
        });
      }
    }
  }
};
</script>

<style scoped>
.export-container {
  position: absolute;
  bottom: 3vh;
  left: 90%;
  transform: translateX(-50%);
  z-index: 1100;
}

.export-pdf-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-pdf-button:hover {
  background-color: #c0392b;
}

.export-pdf-button:disabled {
  background-color: #95a5a6;
  cursor: wait;
}

.export-pdf-button.exporting {
  background-color: #3498db;
}

.export-pdf-button i {
  font-size: 16px;
}
</style>