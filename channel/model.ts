import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';

/**
 * This file defines the properties stored in a Channel
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Channel on the backend
export type Channel = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  ownerId: Types.ObjectId;
  dateCreated: Date;
  name: string;
  description: string;
  users: string[];
};

export type PopulatedChannel = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  ownerId: User;
  dateCreated: Date;
  name: string;
  description: string;
  users: string[];
};

// Mongoose schema definition for interfacing with a MongoDB table
// Channels stored in this table will have these fields, with the
// type given by the type property, inside MongoDB
const ChannelSchema = new Schema<Channel>({
  // The owner userId
  ownerId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // The date the channel was created
  dateCreated: {
    type: Date,
    required: true
  },
  // The description of the channel
  description: {
    type: String,
    required: false
  },
  // The name of the channel
  name: {
    type: String,
    required: true
  },
  // Users in the channel
  users: {
    type: [String],
    required: true
  }
});

const ChannelModel = model<Channel>('Channel', ChannelSchema);
export default ChannelModel;
