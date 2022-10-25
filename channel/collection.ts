import type {HydratedDocument, Types} from 'mongoose';
import type {Channel} from './model';
import ChannelModel from './model';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore channels
 * stored in MongoDB, including adding, finding, updating, and deleting channels.
 *
 * Note: HydratedDocument<Channel> is the output of the Channel() constructor,
 * and contains all the information in Channel. https://mongoosejs.com/docs/typescript.html
 */
class ChannelCollection {
  /**
   * Add a channel to the collection
   *
   * @param {string} ownerId - The id of the owner of the channel
   * @param {string} description - The id of the description of the channel
   * @return {Promise<HydratedDocument<Channel>>} - The newly created channel
   */
  static async addOne(ownerId: Types.ObjectId | string, name: string, description: string): Promise<HydratedDocument<Channel>> {
    const date = new Date();
    const users = new Array<string>();
    const channel = new ChannelModel({
      ownerId,
      dateCreated: date,
      name,
      description,
      users
    });
    await channel.save(); // Saves channel to MongoDB
    return channel.populate('name');
  }

  /**
   * Lets a user join a channel
   *
   * @param name - The id of the channel to be joined
   * @param userId  - The id of the user wanting to join the channel
   * @returns - The updated channel object
   */
  static async joinOne(name: string, userId: Types.ObjectId | string): Promise<HydratedDocument<Channel>> {
    const channel = await ChannelModel.findOne({name}).populate('name');
    const user = await UserCollection.findOneByUserId(userId);
    channel.users.push(user.username);
    await channel.save();
    return channel.populate('users');
  }

  /**
   * Lets a user leave a channel
   *
   * @param name - The name of the channel to be left
   * @param userId  - The id of the user wanting to leave the channel
   * @returns - The updated channel object
   */
  static async leaveOne(name: string, userId: Types.ObjectId | string): Promise<HydratedDocument<Channel>> {
    const channel = await ChannelModel.findOne({name}).populate('name');
    const user = await UserCollection.findOneByUserId(userId);
    const index = channel.users.indexOf(user.username);
    channel.users.splice(index, 1);
    await channel.save();
    return channel.populate('users');
  }

  /**
   * Find a channel by channelId
   *
   * @param {string} channelId - The id of the channel to find
   * @return {Promise<HydratedDocument<Channel>> | Promise<null> } - The channel with the given channelId, if any
   */
  static async findOne(channelId: Types.ObjectId | string): Promise<HydratedDocument<Channel>> {
    return ChannelModel.findOne({_id: channelId}).populate('ownerId');
  }

  /**
   * Find a channel by channel name
   *
   * @param {string} name - The id of the channel to find
   * @return {Promise<HydratedDocument<Channel>> | Promise<null> } - The channel with the given name, if any
   */
  static async findOneByName(name: string): Promise<HydratedDocument<Channel>> {
    return ChannelModel.findOne({name}).populate('name');
  }

  /**
   * Get all the channels in the database
   *
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the channels
   */
  static async findAll(): Promise<Array<HydratedDocument<Channel>>> {
    // Retrieves channels and sorts them alphabetically by name
    return ChannelModel.find({}).sort({name: 1}).populate('ownerId');
  }

  /**
   * Get all the channels owned by given owner
   *
   * @param {string} username - The username of owner of the channel
   * @return {Promise<HydratedDocument<Channel>[]>} - An array of all of the channels
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<Channel>>> {
    const owner = await UserCollection.findOneByUsername(username);
    return ChannelModel.find({ownerId: owner._id}).populate('ownerId');
  }

  /**
   * Update a channel with the new description
   *
   * @param {string} channelId - The id of the channel to be updated
   * @param {string} description - The new description of the channel
   * @return {Promise<HydratedDocument<Channel>>} - The newly updated channel
   */
  static async updateOne(channelId: Types.ObjectId | string, description: string): Promise<HydratedDocument<Channel>> {
    const channel = await ChannelModel.findOne({_id: channelId});
    channel.description = description;
    await channel.save();
    return channel.populate('ownerId');
  }

  /**
   * Delete a channel with given channelId.
   *
   * @param {string} channelId - The channelId of channel to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(channelId: Types.ObjectId | string): Promise<boolean> {
    const channel = await ChannelModel.deleteOne({_id: channelId});
    return channel !== null;
  }

  /**
   * Delete all the channels owned by the given user
   *
   * @param {string} ownerId - The id of owner of channels
   */
  static async deleteMany(ownerId: Types.ObjectId | string): Promise<void> {
    await ChannelModel.deleteMany({ownerId});
  }
}

export default ChannelCollection;
