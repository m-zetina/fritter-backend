import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import UserCollection from '../user/collection';
import ChannelCollection from '../channel/collection';

/**
 * Checks if a Channel with channelId is req.params exists
 */
const isChannelExists = async (req: Request, res: Response, next: NextFunction) => {
  const channel = await ChannelCollection.findOneByName(req.body.name) ?? '';
  if (!channel) {
    res.status(404).json({
      error: {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        channelNotFound: `Channel with channel name ${req.body.name} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a channel name in req.body is already in use
 */
const isChannelNotAlreadyInUse = async (req: Request, res: Response, next: NextFunction) => {
  // Const validFormat = Types.ObjectId.isValid(req.params.channelId);
  const channel = await ChannelCollection.findOneByName(req.body.name);

  if (!channel) {
    next();
    return;
  }

  res.status(409).json({
    error: {
      name: 'A channel with this name already exists.'
    }
  });
};

/**
 * Checks if a channel name in req.body is valid, that is, it matches the name regex
 */
const isValidChannelName = (req: Request, res: Response, next: NextFunction) => {
  const nameRegex = /^[a-zA-Z0-9-_]+$/i;
  if (!nameRegex.test(req.body.name)) {
    res.status(400).json({
      error: {
        name: 'Channel name must be a nonempty alphanumeric string with underscores and/or hyphens.'
      }
    });
    return;
  }

  next();
};

/**
 * Checks if the description of the channel in req.body is valid, i.e not a stream of empty
 * spaces
 */
const isValidChannelDescription = (req: Request, res: Response, next: NextFunction) => {
  const {description} = req.body as {description: string};
  if (!description.trim()) {
    res.status(400).json({
      error: 'Channel description must be at least one character long.'
    });
    return;
  }

  next();
};

/**
 * Checks if the current user is the owner of the channel whose channelId is in req.params
 */
const isChannelOwner = async (req: Request, res: Response, next: NextFunction) => {
  const channel = await ChannelCollection.findOne(req.body.channelId);
  const userId = channel.ownerId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: 'Cannot delete other users\' channels.'
    });
    return;
  }

  next();
};

/**
 * Checks if the current user is not already in the channel whose channelId is in req.body
 */
const isUserNotAlreadyInChannel = async (req: Request, res: Response, next: NextFunction) => {
  const channel = await ChannelCollection.findOneByName(req.body.name);
  const user = await UserCollection.findOneByUserId(req.session.userId);
  for (const username of channel.users) {
    if (user.username === username) {
      res.status(403).json({
        error: 'User is already in this channel.'
      });
      return;
    }
  }

  next();
};

/**
 * Checks if the current user is in the channel whose name is in req.body
 */
const isUserInChannel = async (req: Request, res: Response, next: NextFunction) => {
  const channel = await ChannelCollection.findOneByName(req.body.name);
  const user = await UserCollection.findOneByUserId(req.session.userId);
  for (const username of channel.users) {
    if (user.username === username) {
      next();
      return;
    }
  }

  res.status(403).json({
    error: 'User is not in this channel.'
  });
};

export {
  isValidChannelDescription,
  isChannelExists,
  isChannelOwner,
  isValidChannelName,
  isChannelNotAlreadyInUse,
  isUserNotAlreadyInChannel,
  isUserInChannel
};
