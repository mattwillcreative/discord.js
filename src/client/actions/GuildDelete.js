const Action = require('./Action');
const Constants = require('../../util/Constants');

class GuildDeleteAction extends Action {
  constructor(client) {
    super(client);
    this.deleted = new Map();
  }

  handle(data) {
    const client = this.client;

    let guild = client.guilds.get(data.id);
    if (guild) {
      for (const channel of guild.channels.values()) channel.stopTyping(true);

      if (guild.available && data.unavailable) {
        // guild is unavailable
        guild.available = false;
        client.emit(Constants.Events.GUILD_UNAVAILABLE, guild);

        // stops the GuildDelete packet thinking a guild was actually deleted,
        // handles emitting of event itself
        return {
          guild: null,
        };
      }

      // delete guild
      client.guilds.delete(guild.id);
      this.deleted.set(guild.id, guild);
      this.scheduleForDeletion(guild.id);
    } else {
      guild = this.deleted.get(data.id) || null;
    }

    return {
      guild,
    };
  }

  scheduleForDeletion(id) {
    this.client.setTimeout(() => this.deleted.delete(id), this.client.options.restWsBridgeTimeout);
  }
}

/**
 * Emitted whenever a guild becomes unavailable, likely due to a server outage.
 * @event Client#guildUnavailable
 * @param {Guild} guild The guild that has become unavailable.
 */

module.exports = GuildDeleteAction;