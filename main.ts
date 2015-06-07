/// <reference path="references.d.ts" />

// TODO
// * Rename selectable to hoverable
// * Add an actual ISelectable
// * Some sort of Math.flooring x/y normalizer
// * Separate out note description sidebar and make that selectable, maybe?
// * Start moving stuff into different files.

class C {
  public static NoteWidth = 40;
  public static NoteHeight = 15;
}

class Depths {
  public static GridDepth = 0;
  public static NoteDepth = 10;
}

class NoteUIState extends Base {
  @prop selected = false;
}

class NoteModel extends Base {
  @prop uiState = new NoteUIState();

  @prop length = 0;
  @prop start = 0;
  @prop octave = 4;
  @validatedProp(NoteModel.validateKey) key: string = "A";

  get x(): number { return this.start; }
  get y(): number { return this.octave * NoteModel.keysInOctave.length + NoteModel.keysInOctave.indexOf(this.key); }

  public static keysInOctave: string[] = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

  public static getAllNotes(): string[] {
    var result:string[] = [];
    var keys = NoteModel.keysInOctave;

    for (var i = 1; i < 8; i++) {
      for (var j = 0; j < keys.length; j++) {
        result.push(`${keys[j]}${i}`);
      }
    }

    return result;
  }

  /*
    Validate that `key` is actually a real key. No flats sorry.
  */
  public static validateKey(key: string): boolean {
    return NoteModel.keysInOctave.indexOf(key.toUpperCase()) !== -1;
  }

  private validateOctave(octave: number): boolean {
    // TODO

    return true;
  }
}

interface IRenderable {
  render(context: CanvasRenderingContext2D): void;
}

interface IHoverable {
  /**
    x and y are pixel values that have not been normalized (except such that (0, 0) is the top left of the canvas)
  */
  hasSomethingToHoverOverAt(x: number, y: number): boolean;

  hoverOver(x: number, y: number): void;

  unhover(): void;

  /**
    How high the hoverable thing is in the hierarchy. Bigger numbers are on top of smaller numbers.
  */
  depth: number;
}

class PianoRollModel extends Base {
  @prop canvasWidth = 600;
  @prop canvasHeight = 600;
}

class NoteViewModel extends Base implements IHoverable {
  @prop notes: NoteModel[] = [];

  get selectedNotes(): NoteModel[] {
    return this.notes.filter(note => note.uiState.selected);
  }

  /**
    Returns the note at (x, y) (normalized to grid positions) or undefined
    if there isn't one.
  */
  private getNoteAt(x: number, y: number): Maybe<NoteModel> {
    var normalizedX = Math.floor(x / C.NoteWidth);
    var normalizedY = Math.floor(y / C.NoteHeight);

    for (var note of this.notes) {
      if (normalizedX >= note.x && normalizedX < note.x + note.length && note.y == normalizedY) {
        return new Maybe(note);
      }
    }

    return new Maybe<NoteModel>();
  }

  private deselectAllNotes(): void {
    var notes = this.selectedNotes;

    for (var n of notes) {
      n.uiState.selected = false;
    }
  }

  //
  // ISelectableThing
  //

  hasSomethingToHoverOverAt(x: number, y: number): boolean {
    return this.getNoteAt(x, y).hasValue;
  }

  hoverOver(x: number, y: number): void {
    // Deselect any old selected note(s)

    this.deselectAllNotes();

    // Select new note

    var note = this.getNoteAt(x, y);

    if (note.hasValue) {
      note.value.uiState.selected = true;
    }
  }

  unhover(): void {
    this.deselectAllNotes();
  }

  depth = Depths.NoteDepth;
}

class NoteView extends Base implements IRenderable {
  public model: NoteViewModel = new NoteViewModel();

  constructor() {
    super();

    var note1 = new NoteModel();
    note1.key = "A";
    note1.octave = 0;
    note1.length = 2;
    note1.start = 2;

    var note2 = new NoteModel();
    note2.key = "B";
    note2.octave = 0;
    note2.length = 4;
    note2.start = 3;

    this.model.notes.push(note1);
    this.model.notes.push(note2);
  }

  //
  // IRenderable
  //

  public render(context: CanvasRenderingContext2D): void {
    var model = this.model;

    // Draw notes

    for (var note of model.notes) {
      if (note.uiState.selected) {
        context.fillStyle = "rgb(255, 100, 100)";
      } else {
        context.fillStyle = "rgb(255, 0, 0)";
      }

      context.fillRect(C.NoteWidth * note.x, C.NoteHeight * note.y, C.NoteWidth * note.length, C.NoteHeight);
    }
  }
}

class GridModel extends Base implements IHoverable {
  @prop widthInNotes = 40;
  @prop heightInNotes = 20;

  // Selection related properties

  @prop hasSelection = false;
  @prop selectionX = -1;
  @prop selectionY = -1;

  //
  // ISelectableThing
  //

  hasSomethingToHoverOverAt(x: number, y: number): boolean {
    return true;
  }

  hoverOver(x: number, y: number): void {
    // Deselect any old selected note(s)

    this.hasSelection = true;

    this.selectionX = Math.floor(x / C.NoteWidth);
    this.selectionY = Math.floor(y / C.NoteHeight);
  }

  unhover(): void {
    this.hasSelection = false;
  }

  depth = Depths.GridDepth;
}

class GridView extends Base implements IRenderable {
  public model = new GridModel();

  //
  // IRenderable
  //

  public render(context: CanvasRenderingContext2D): void {
    var model = this.model;

    // Draw grid

    for (var i = 0; i < model.widthInNotes; i++) {
      for (var j = 0; j < model.heightInNotes; j++) {
        context.strokeRect(i * C.NoteWidth, j * C.NoteHeight, C.NoteWidth, C.NoteHeight);
      }
    }

    if (this.model.hasSelection) {
      context.fillStyle = "rgb(200, 200, 200)";
      context.fillRect(C.NoteWidth * this.model.selectionX, C.NoteHeight * this.model.selectionY, C.NoteWidth, C.NoteHeight);
    }
  }
}

// TODO
// * I should generalize ISelectableThing to IMouseableThing and add both click and select actions?

class PianoRollView extends Base {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private model: PianoRollModel;

  private selectableThings: IHoverable[];
  private currentlySelectedThing: IHoverable;
  private drawableThings: IRenderable[];

  constructor() {
    super();

    var gridView = new GridView();
    var noteView = new NoteView();

    this.selectableThings = [noteView.model, gridView.model];
    this.drawableThings = [noteView, gridView];

    this.model = new PianoRollModel();

    this.canvas = <HTMLCanvasElement> document.getElementById("main");
    this.context = <CanvasRenderingContext2D> this.canvas.getContext('2d');

    this.setUpCanvas();

    window.requestAnimationFrame(this.render);
  }

  private setUpCanvas() {
    this.canvas.width = this.model.canvasWidth;
    this.canvas.height = this.model.canvasHeight;

    this.context.translate(0.5, 0.5);

    this.canvas.addEventListener("mousemove", (ev: MouseEvent) => {
      this.mouseMove(ev.offsetX, ev.offsetY);
    });
  }

  private mouseMove(x: number, y: number) {
    for (var thing of this.selectableThings) {
     if (thing.hasSomethingToHoverOverAt(x, y)) {
        // Select the new thing.

        thing.hoverOver(x, y);

        // Deselect the previous thing, if there was one.

        if (this.currentlySelectedThing && this.currentlySelectedThing != thing) {
          this.currentlySelectedThing.unhover();
        }

        this.currentlySelectedThing = thing;

        break;
      }
    }
  }

  // TODO: Once I separate out the grid class, instead of using C.NoteBleh, put that onto the grid model
  private render() {
    var model = this.model;

    this.context.clearRect(0, 0, this.model.canvasWidth, this.model.canvasHeight);

    // Draw children

    for (var i = 0; i < this.drawableThings.length; i++) {
      this.drawableThings[i].render(this.context);
    }

    // Draw note descriptions

    var noteNames = NoteModel.getAllNotes();

    // TODO: heightInNotes hardcode.
    for (var j = 0; j < 20; j++) {
      this.context.strokeText(noteNames[j], 5, j * C.NoteHeight - 5);
    }

    window.requestAnimationFrame(this.render);
  }

}

var test: PianoRollModel = new PianoRollModel();

document.addEventListener("DOMContentLoaded", (ev) => {
  var pianoRoll = new PianoRollView();
});