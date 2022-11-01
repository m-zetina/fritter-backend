import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';

/**
 * This file defines the properties stored in a Feed
 */

// Type definition for Feed on the backend
export type Feed = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  ownerId: Types.ObjectId;
  filters: string[];
  activeFilter: string;
  freets: string[];
  lastRefresh: Date;
};

export type PopulatedFeed = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  ownerId: User;
  filters: string[];
  activeFilter: string;
  freets: string[];
  lastRefresh: Date;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Feeds stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const FeedSchema = new Schema<Feed>({
  // The owner userId
  ownerId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // Available filters to apply to the feed
  filters: {
    type: [String],
    required: true
  },
  // Active filter being applied to the feed
  activeFilter: {
    type: String,
    required: true
  },
  // Freets in the channel
  freets: {
    type: [String],
    required: true
  },
  lastRefresh: {
    type: Date,
    required: true
  }
});

const FeedModel = model<Feed>('Feed', FeedSchema);
export default FeedModel;
