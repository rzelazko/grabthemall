/*
 * File based on on Screengrab! extension by Andy Mutton
 */

var GrabThemAll_ScreenShot = {
	doSS : function(windowToShot, dir, fileBaseName) {
		this.dir = dir;
		this.fileBaseName = fileBaseName;
		this.windowToShot = windowToShot;

		if (GrabThemAll_Utils.getPref('completepage') > 0) {
			this.grabCompletePage();
		} else {
			this.grabWindow();
		}

	},

	grabWindow : function() {
		var browserDim = new GrabThemAll_Dimensions.BrowserWindowDimensions();
		var box = new GrabThemAll_Dimensions.Box(0, 0, browserDim.getWidth(),
				browserDim.getHeightIgnoringExternalities());
		this.grab(this.windowToShot, box);
	},

	grabCompletePage : function() {
		var frameDim = new GrabThemAll_Dimensions.FrameDimensions();
		var width = frameDim.getDocumentWidth();
		var height = frameDim.getDocumentHeight();
		if (frameDim.getFrameWidth() > width) {
			width = frameDim.getFrameWidth();
		}
		if (frameDim.getFrameHeight() > height) {
			height = frameDim.getFrameHeight();
		}

		var box = new GrabThemAll_Dimensions.Box(0, 0, width, height);
		this.grab(frameDim.getWindow(), box);
	},

	grab : function(windowToGrab, box) {
		var format = GrabThemAll_Utils.getPref('filetype') == 0
				? 'jpeg'
				: 'png';
		var canvas = GrabThemAll_Utils.prepareCanvas(box.getWidth(), box
				.getHeight());
		var context = GrabThemAll_Utils.prepareContext(canvas, box);
		context.drawWindow(windowToGrab, box.getX(), box.getY(),
				box.getWidth(), box.getHeight(), 'rgb(255,255,255)');
		context.restore();
		var dataUrl = canvas.toDataURL('image/' + format);
		GrabThemAll_Utils.saveScreenToFile(this.dir, this.fileBaseName,
				dataUrl, format);
	}
}
