import type {HydratedDocument} from 'mongoose';
import type {Feed, PopulatedFeed} from './model';

type FeedResponse = {
  _id: string;
  owner: string;
  filters: string[];
  activeFilter: string;
  freets: string[];
};

/**
 * Transform a raw Feed object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Feed>} feed - A Feed
 * @returns {FeedResponse} - The channel object formatted for the frontend
 */
const constructFeedResponse = (feed: HydratedDocument<Feed>): FeedResponse => {
  const feedCopy: PopulatedFeed = {
    ...feed.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = feedCopy.ownerId;
  delete feedCopy.ownerId;
  return {
    ...feedCopy,
    _id: feedCopy._id.toString(),
    owner: username
  };
};

export {
  constructFeedResponse
};
