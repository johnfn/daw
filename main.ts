/// <reference path="references.d.ts" />

// TODO
// * Separate out grid from MainView
// * and make that selectable, too.
// * Separate out note description sidebar and make that selectable, maybe?
// * Start moving stuff into different files.

class C {
  public static NoteWidth = 40;
  public static NoteHeight = 15;
}

class NoteUIState extends Base {
  @prop selected = false;

  vv = true;
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

interface IDrawableThing {
  render(context: CanvasRenderingContext2D): void;
}

interface ISelectableThing {
  /**
    x and y are pixel values that have not been normalized (except such that (0, 0) is the top left of the canvas)
  */
  hasSomethingToSelectAt(x: number, y: number): boolean;

  selectAt(x: number, y: number): void;

  deselect(): void;

  /**
    How high the selectable thing is in the hierarchy. Bigger numbers are on top of smaller numbers.
  */
  depth(): number;

  /**
    Register this as a selectable thing. Necessary if you want it to actually be selected...
  */
  register(): void;
}

class PianoRollModel extends Base {
  @prop canvasWidth = 600;
  @prop canvasHeight = 600;
}

class NoteViewModel extends Base implements ISelectableThing {
  @prop noteWidth = C.NoteWidth;
  @prop noteHeight = C.NoteHeight;

  @prop notes: NoteModel[] = [];

  get selectedNotes(): NoteModel[] {
    return this.notes.filter(note => note.uiState.selected);
  }

  /**
    Returns the note at (x, y) (normalized to grid positions) or undefined
    if there isn't one.
  */
  private getNoteAt(x: number, y: number): Maybe<NoteModel> {
    var normalizedX = Math.floor(x / this.noteWidth);
    var normalizedY = Math.floor(y / this.noteHeight);

    for (var note of this.notes) {
      if (normalizedX >= note.x && normalizedX < note.x + note.length && note.y == normalizedY) {
        return new Maybe(note);
      }
    }

    return new Maybe<NoteModel>();
  }

  //
  // ISelectableThing
  //

  hasSomethingToSelectAt(x: number, y: number): boolean {
    return this.getNoteAt(x, y).hasValue;
  }

  selectAt(x: number, y: number): void {
    // Deselect any old selected note(s)

    var notes = this.selectedNotes;

    for (var n of notes) {
      n.uiState.selected = false;
    }

    // Select new note

    var note = this.getNoteAt(x, y);

    if (note.hasValue) {
      note.value.uiState.selected = true;
    }
  }

  deselect(): void {
    console.warn("Stub");
  }

  /**
    How high the selectable thing is in the hierarchy. Bigger numbers are on top of smaller numbers.
  */
  depth(): number {
    return 0;
  }

  // NOTE this is the wrong abstraction.

  /**
    Register this as a selectable thing. Necessary if you want it to actually be selected...
  */
  register(): void {
    console.warn("stub");
  }
}

class NoteView extends Base implements IDrawableThing {
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
  // IDrawableThing
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

      context.fillRect(model.noteWidth * note.x, model.noteHeight * note.y, model.noteWidth * note.length, model.noteHeight);
    }
  }
}

class GridModel extends Base {
  @prop widthInNotes = 40;
  @prop heightInNotes = 20;
}

class GridView extends Base implements IDrawableThing {
  private model = new GridModel();

  //
  // IDrawableThing
  //

  public render(context: CanvasRenderingContext2D): void {
    var model = this.model;

    // Draw grid

    for (var i = 0; i < model.widthInNotes; i++) {
      for (var j = 0; j < model.heightInNotes; j++) {
        context.strokeRect(i * C.NoteWidth, j * C.NoteHeight, C.NoteWidth, C.NoteHeight);
      }
    }
  }
}

// TODO
// * I should generalize ISelectableThing to IMouseableThing and add both click and select actions?

class PianoRollView extends Base {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private model: PianoRollModel;

  private selectableThings: ISelectableThing[];
  private drawableThings: IDrawableThing[];

  constructor() {
    super();

    var gridView = new GridView();
    var noteView = new NoteView();

    this.selectableThings = [noteView.model];
    this.drawableThings = [noteView, gridView];

    this.model = new PianoRollModel();

    this.canvas = <HTMLCanvasElement> document.getElementById("main");
    this.context = <CanvasRenderingContext2D> this.canvas.getContext('2d');

    this.setUpCanvas();

    window.requestAnimationFrame(this.render);
  }

  private getItemAtPoint(x: number, y: number) {
    // Check notes
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
     if (thing.hasSomethingToSelectAt(x, y)) {
        thing.selectAt(x, y);

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