import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import * as userValidator from '../user/middleware';
import * as util from './util';
import * as channelValidator from '../channel/middleware';
import ChannelCollection from './collection';

const router = express.Router();

/**
 * Get all the channels
 *
 * @name GET /api/channels
 *
 * @return {ChannelResponse[]} - A list of all the channels sorted in descending
 *                      order by date created
 */
/**
 * Get channels by owner.
 *
 * @name GET /api/channels?ownerId=id
 *
 * @return {ChannelResponse[]} - An array of channels owned by user with id, ownerId
 * @throws {400} - If ownerId is not given
 * @throws {404} - If no user has given ownerId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if ownerId query parameter was supplied
    if (req.query.author !== undefined) {
      next();
      return;
    }

    const allChannels = await ChannelCollection.findAll();
    const response = allChannels.map(util.constructChannelResponse);
    res.status(200).json(response);
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response) => {
    const ownerChannels = await ChannelCollection.findAllByUsername(req.query.author as string);
    const response = ownerChannels.map(util.constructChannelResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new channel.
 *
 * @name POST /api/channels
 *
 * @param {string} name - The name of the channel
 * @param {string} description - The description of the channel
 * @return {ChannelResponse} - The created channel
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the channel name is empty or not alphanumeric with hyphens and/or underscores
 * @throws {400} - If the description is empty or a stream of empty spaces
 * @throws {409} - If the name is already in use
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    channelValidator.isValidChannelDescription,
    channelValidator.isValidChannelName,
    channelValidator.isChannelNotAlreadyInUse
  ],
  async (req: Request, res: Response) => {
    const ownerId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const channel = await ChannelCollection.addOne(ownerId, req.body.name, req.body.description);

    res.status(201).json({
      message: `Your channel ${channel.name} was created successfully.`,
      channel: util.constructChannelResponse(channel)
    });
  }
);

/**
 * Delete a channel
 *
 * @name DELETE /api/channels/:id
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the owner of
 *                 the channel
 * @throws {404} - If the channelId is not valid
 */
router.delete(
  '/:channelId?',
  [
    userValidator.isUserLoggedIn,
    channelValidator.isChannelExists,
    channelValidator.isChannelOwner
  ],
  async (req: Request, res: Response) => {
    await ChannelCollection.deleteOne(req.params.channelId);
    res.status(200).json({
      message: 'Your channel was deleted successfully.'
    });
  }
);

/**
 * Modify a channel description
 *
 * @name PUT /api/freets/:id
 *
 * @param {string} description - the new description for the channel
 * @return {ChannelResponse} - the updated channel
 * @throws {403} - if the user is not logged in or not the owner of
 *                 of the channel
 * @throws {404} - If the channelId is not valid
 * @throws {400} - If the description is empty or a stream of empty spaces
 */
router.put(
  '/:channelId?',
  [
    userValidator.isUserLoggedIn,
    channelValidator.isChannelExists,
    channelValidator.isChannelOwner,
    channelValidator.isValidChannelDescription
  ],
  async (req: Request, res: Response) => {
    const channel = await ChannelCollection.updateOne(req.params.channelId, req.body.description);
    res.status(200).json({
      message: `Your channel ${channel.name} was updated successfully.`,
      channel: util.constructChannelResponse(channel)
    });
  }
);

/**
 * Join a channel.
 *
 * @name POST /api/channels
 *
 * @param {string} name - The name of the channel
 * @return {ChannelResponse} - The channel joined
 * @throws {403} - If the user is not logged in
 * @throws {403} - If the user is already in the channel
 * @throws {404} - If the channel does not exist
 */
router.post(
  '/join',
  [
    userValidator.isUserLoggedIn,
    channelValidator.isChannelExists,
    channelValidator.isUserNotAlreadyInChannel
  ],
  async (req: Request, res: Response) => {
    const ownerId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const channel = await ChannelCollection.joinOne(req.body.name, ownerId);
    res.status(201).json({
      message: `You have successfully joined ${channel.name}.`,
      channel: util.constructChannelResponse(channel)
    });
  }
);

/**
 * Leave a channel.
 *
 * @name POST /api/channels
 *
 * @param {string} name - The name of the channel
 * @return {ChannelResponse} - The created channel
 * @throws {403} - If the user is not logged in
 * @throws {403} - If the user is not in the channel
 * @throws {404} - If the channel does not exist
 */
router.post(
  '/leave',
  [
    userValidator.isUserLoggedIn,
    channelValidator.isChannelExists,
    channelValidator.isUserInChannel
  ],
  async (req: Request, res: Response) => {
    const ownerId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const channel = await ChannelCollection.leaveOne(req.body.name, ownerId);

    res.status(201).json({
      message: `You have successfully left ${channel.name}.`,
      channel: util.constructChannelResponse(channel)
    });
  }
);

export {router as channelRouter};
