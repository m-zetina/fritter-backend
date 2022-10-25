import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Channel, PopulatedChannel} from './model';

type ChannelResponse = {
  _id: string;
  name: string;
  owner: string;
  dateCreated: string;
  description: string;
  users: string[];
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

/**
 * Transform a raw Channel object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Channel>} channel - A channel
 * @returns {ChannelResponse} - The channel object formatted for the frontend
 */
const constructChannelResponse = (channel: HydratedDocument<Channel>): ChannelResponse => {
  const channelCopy: PopulatedChannel = {
    ...channel.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = channelCopy.ownerId;
  delete channelCopy.ownerId;
  return {
    ...channelCopy,
    _id: channelCopy._id.toString(),
    owner: username,
    dateCreated: formatDate(channel.dateCreated)
  };
};

export {
  constructChannelResponse
};
