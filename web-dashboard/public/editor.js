// Initialize Fabric.js canvas
const canvas = new fabric.Canvas('canvas');

// Function to add widgets to the canvas
function addWidget(type) {
    let widget;

    // Create a widget based on its type
    switch (type) {
        case 'header':
            widget = new fabric.Textbox('Header Text', {
                left: 50,
                top: 50,
                fontSize: 24,
                fill: 'black',
                width: 300,
                editable: true, // Allow users to edit the text
            });
            break;

        case 'slider':
            widget = new fabric.Rect({
                left: 50,
                top: 100,
                width: 300,
                height: 50,
                fill: 'blue',
            });
            break;

        case 'timeDate':
            const currentTime = new Date().toLocaleString();
            widget = new fabric.Textbox(currentTime, {
                left: 50,
                top: 150,
                fontSize: 16,
                fill: 'green',
                width: 300,
                editable: false, // Keep time/date static
            });
            break;

        case 'iframe':
            widget = new fabric.Rect({
                left: 50,
                top: 200,
                width: 400,
                height: 300,
                fill: 'gray',
            });
            break;

        case 'text':
            widget = new fabric.Textbox('Sample Text', {
                left: 50,
                top: 250,
                fontSize: 18,
                fill: 'black',
                width: 300,
                editable: true,
            });
            break;

        case 'square':
            widget = new fabric.Rect({
                left: 200,
                top: 300,
                width: 100,
                height: 100,
                fill: 'green',
            });
            break;

        case 'rectangle':
            widget = new fabric.Rect({
                left: 350,
                top: 350,
                width: 150,
                height: 100,
                fill: 'red',
            });
            break;

        case 'circle':
            widget = new fabric.Circle({
                left: 300,
                top: 300,
                radius: 50,
                fill: 'purple',
            });
            break;

        case 'triangle':
            widget = new fabric.Triangle({
                left: 400,
                top: 400,
                width: 60,
                height: 60,
                fill: 'orange',
            });
            break;

        default:
            console.error('Unknown widget type:', type);
            return;
    }

    // Add the widget to the canvas
    canvas.add(widget);
    canvas.setActiveObject(widget);
}

// Add Event Listeners for toolbar buttons
document.getElementById('header').addEventListener('click', () => addWidget('header'));
document.getElementById('slider').addEventListener('click', () => addWidget('slider'));
document.getElementById('timeDate').addEventListener('click', () => addWidget('timeDate'));
document.getElementById('iframe').addEventListener('click', () => addWidget('iframe'));
document.getElementById('text').addEventListener('click', () => addWidget('text'));
document.getElementById('square').addEventListener('click', () => addWidget('square'));
document.getElementById('rectangle').addEventListener('click', () => addWidget('rectangle'));
document.getElementById('circle').addEventListener('click', () => addWidget('circle'));
document.getElementById('triangle').addEventListener('click', () => addWidget('triangle'));

// Save Content functionality
document.getElementById('saveContent').addEventListener('click', () => {
    const jsonData = JSON.stringify(canvas.toJSON()); // Get JSON representation of canvas

    // Show loading indicator while saving
    document.getElementById('loading').style.display = 'block';

    // Simulate saving (replace with actual API call if needed)
    setTimeout(() => {
        localStorage.setItem('canvasContent', jsonData); // Save to localStorage
        alert('Content saved successfully!');
        document.getElementById('loading').style.display = 'none';
    }, 1000);
});

// Responsive canvas resizing
window.addEventListener('resize', adjustCanvasSize);

function adjustCanvasSize() {
    const canvasContainer = document.getElementById('canvasContainer');
    const width = canvasContainer.offsetWidth;
    const height = canvasContainer.offsetHeight;

    canvas.setWidth(width);
    canvas.setHeight(height);

    // Optionally scale objects proportionally
    canvas.getObjects().forEach((obj) => {
        obj.left = (obj.left * width) / canvas.width;
        obj.top = (obj.top * height) / canvas.height;
        obj.scaleX = (obj.scaleX * width) / canvas.width;
        obj.scaleY = (obj.scaleY * height) / canvas.height;
        obj.setCoords();
    });

    canvas.renderAll();
}

// Adjust the canvas size on page load
adjustCanvasSize();
