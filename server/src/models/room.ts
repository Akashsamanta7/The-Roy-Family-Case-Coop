import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  roomId: string;
  caseId: string;
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;

  officers: {
    officerId: string;
    name: string;
    rank: string;
    isOnline: boolean;
    socketId?: string;
    lastKnownActivity?: string;
  }[];

  reviewedEvidence: string[];
  reviewedPeople: string[];
  reviewedTimelineEvents: string[];

  teamNotes: {
    noteId: string;
    officerId: string;
    officerName: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }[];

  personalNotes: {
    officerId: string;
    notes: {
      noteId: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }[];

  activityLog: {
    activityId: string;
    officerId?: string;
    officerName?: string;
    type: string;
    message: string;
    createdAt: Date;
  }[];

  verdict: {
    openedBy?: string;
    isSubmitted: boolean;
    submittedBy?: string;
    answers: {
      officerId: string;
      answers: Record<string, unknown>;
      isReady: boolean;
      updatedAt: Date;
    }[];
  };
}

const officerSchema = new Schema(
  {
    officerId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rank: {
      type: String,
      required: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    socketId: {
      type: String,
      default: null,
    },
    lastKnownActivity: {
      type: String,
      default: "Offline",
    },
  },
  { _id: false }
);

const noteSchema = new Schema(
  {
    noteId: {
      type: String,
      required: true,
    },
    officerId: {
      type: String,
      required: true,
    },
    officerName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

const personalNoteSchema = new Schema(
  {
    noteId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

const personalOfficerNotesSchema = new Schema(
  {
    officerId: {
      type: String,
      required: true,
    },
    notes: [personalNoteSchema],
  },
  {
    _id: false,
  }
);

const activitySchema = new Schema(
  {
    activityId: {
      type: String,
      required: true,
    },
    officerId: String,
    officerName: String,
    type: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

const verdictAnswerSchema = new Schema(
  {
    officerId: {
      type: String,
      required: true,
    },
    answers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isReady: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

const verdictSchema = new Schema(
  {
    openedBy: String,

    isSubmitted: {
      type: Boolean,
      default: false,
    },

    submittedBy: String,

    answers: {
      type: [verdictAnswerSchema],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const roomSchema = new Schema<IRoom>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    caseId: {
      type: String,
      required: true,
      default: "the-fire-at-roy-bari",
    },

    lastActivity: {
      type: Date,
      default: Date.now,
    },

    officers: {
      type: [officerSchema],
      default: [],
    },

    reviewedEvidence: {
      type: [String],
      default: [],
    },

    reviewedPeople: {
      type: [String],
      default: [],
    },

    reviewedTimelineEvents: {
      type: [String],
      default: [],
    },

    teamNotes: {
      type: [noteSchema],
      default: [],
    },

    personalNotes: {
      type: [personalOfficerNotesSchema],
      default: [],
    },

    activityLog: {
      type: [activitySchema],
      default: [],
    },

    verdict: {
      type: verdictSchema,
      default: () => ({
        isSubmitted: false,
        answers: [],
      }),
    },
  },
  {
    timestamps: true,
  }
);

export const Room =
  mongoose.models.Room ||
  mongoose.model<IRoom>("Room", roomSchema);
