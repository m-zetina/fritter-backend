import type {HydratedDocument, Types} from 'mongoose';
import type {Feed} from './model';
import FeedModel from './model';
import FreetCollection from '../freet/collection';
import type {Freet} from '../freet/model';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore feeds
 * stored in MongoDB, including adding, finding, updating, and deleting feeds.
 *
 * Note: HydratedDocument<Feed> is the output of the Feed() constructor,
 * and contains all the information in Feed. https://mongoosejs.com/docs/typescript.html
 */
class FeedCollection {
  /**
   * Add a feed to the collection
   *
   * @param {string} ownerId - The id of the owner of the feed
   * @return {Promise<HydratedDocument<Feed>>} - The newly created feed
   */
  static async addOne(ownerId: Types.ObjectId | string): Promise<HydratedDocument<Feed>> {
    const lastRefresh = new Date();
    const freets = new Array<string>();
    const filters: string[] = [];
    const activeFilter = 'latest';
    const feed = new FeedModel({
      ownerId,
      filters,
      activeFilter,
      freets,
      lastRefresh
    });
    await feed.save(); // Saves feed to MongoDB
    return feed.populate('freets');
  }

  /**
   * Find a feed by ownerId
   *
   * @param {string} ownerId - The owner id of the feed to find
   * @return {Promise<HydratedDocument<Feed>> | Promise<null> } - The feed with the given ownerId, if any
   */
  static async findOneByUser(ownerId: Types.ObjectId | string): Promise<HydratedDocument<Feed>> {
    return FeedModel.findOne({ownerId}).populate('ownerId');
  }

  /**
   * Find a feed by its id
   *
   * @param {string} feedId - The id of the feed to find
   * @return {Promise<HydratedDocument<Feed>> | Promise<null> } - The feed with the given feedId, if any
   */
  static async findOne(feedId: Types.ObjectId | string): Promise<HydratedDocument<Feed>> {
    return FeedModel.findOne({_id: feedId}).populate('_id');
  }

  /**
   * Refresh a feed with the new freets
   *
   * @param {string} ownerId - The id of the owner of the feed to be updated
   * @return {Promise<HydratedDocument<Feed>>} - The newly updated channel
   */
  static async refreshFeed(ownerId: Types.ObjectId | string): Promise<HydratedDocument<Feed>> {
    const feed = await FeedModel.findOne({ownerId});
    // Const freets = feed.activeFilter === 'latest' ? await FreetCollection.findAll() : await this.getFollowingFreets(ownerId);
    let freets: Freet[];
    if (feed.activeFilter === 'latest') {
      freets = await FreetCollection.findAll();
    } else if (feed.activeFilter === 'following') {
      freets = await this.getFollowingFreets(ownerId);
    } else {
      freets = await FreetCollection.findAllWithTag(feed.activeFilter);
    }

    if (freets) {
      feed.freets = [];
      for (const freet of freets) {
        feed.freets.push(freet._id.toString());
      }
    }

    feed.lastRefresh = new Date();
    await feed.save();
    return (await feed.populate('freets')).populate('lastRefresh');
  }

  /**
   * Refresh a feed's active filter
   *
   * @param {string} ownerId - The id of the owner of the feed to be updated
   * @param {string} activeFilter - The filter to set the feed to
   * @return {Promise<HydratedDocument<Feed>>} - The newly updated channel
   */
  static async updateActiveFilter(ownerId: Types.ObjectId | string, activeFilter: string): Promise<HydratedDocument<Feed>> {
    const feed = await FeedModel.findOne({ownerId});
    feed.activeFilter = activeFilter;
    await feed.save();
    return this.refreshFeed(ownerId);
  }

  /**
   * Delete a feed with given feedId.
   *
   * @param {string} feedId - The channelId of channel to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(feedId: Types.ObjectId | string): Promise<boolean> {
    const feed = await FeedModel.deleteOne({_id: feedId});
    return feed !== null;
  }

  /**
   * Get the freets from the users the owner follows
   *
   * @param {string} ownerId - The id of the owner of the feed
   * @return {Promise<Array<HydratedDocument<Freet>>>} - The newly updated feed
   */
  private static async getFollowingFreets(ownerId: Types.ObjectId | string): Promise<Array<HydratedDocument<Freet>>> {
    const freets = await FreetCollection.findAll();
    const user = await UserCollection.findOneByUserId(ownerId);
    const followingFreets = [];
    for (const freet of freets) {
      if (freet.authorId.toString() in user.following) {
        followingFreets.push(freet);
      }
    }

    return followingFreets;
  }
}

export default FeedCollection;
