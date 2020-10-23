import { MessageEmbed, User, Guild as dGuild, PermissionResolvable, TextChannel, VoiceChannel } from "discord.js";
import { BelongsTo, Column, HasMany, Table, Model, ForeignKey, DataType } from "sequelize-typescript";
import { getTeamColor, getTeamName } from "../../commands/team.command/util";
import Guild from "./Guild.model";
import TeamPlayer from "./TeamPlayer.model";

@Table({ timestamps: false, charset: 'utf-8', collate:'utf8_general_ci' })
export default class Team extends Model {

    @BelongsTo(() => Guild, { foreignKey: 'gid' })
    public guild: Guild;

    @ForeignKey(() => Guild)
    @Column(DataType.STRING)
    public gid: string;

    @HasMany(() => TeamPlayer, { foreignKey: 'team_id', as: 'members' })
    public members: TeamPlayer[] = [];

    @Column({ type: DataType.STRING })
    public color: string;

    @Column({ type: DataType.STRING })
    public name: string;

    @Column({ type: DataType.STRING })
    public prefix: string;

    @Column(DataType.STRING)
    public indexedName: string;

    @Column(DataType.STRING)
    public text_cid: string;

    @Column(DataType.STRING)
    public voice_cid: string;

    @Column(DataType.STRING)
    public category_cid: string;

    @Column(DataType.STRING)
    public role_id: string;

    /* 
        @Column({ type: DataType.INTEGER })
        public api_id: number; */
    /*  //TODO
        @HasMany(() => JokeVote, { foreignKey: 'joke_id', as: 'votes' })
        public votes:JokeVote[]; */
    createEmbed(): Promise<MessageEmbed> {
        return this.reload().then((rloaded) => new MessageEmbed()
            .setColor(rloaded.color)
            .setTitle(rloaded.name)
            .setDescription(rloaded.indexedName)
            .addFields(
                rloaded.members.map((tm, idx) => {
                    return {
                        name: `Player #${idx + 1}`,
                        value: `<@${tm.id}>`
                    }
                })
            )
        )

    }

    /**
     * 
     * @param g Discord.js Guild
     * @param n Number of teams to be made
     */
    static createTeams(g: dGuild, n: number): Promise<Team[]> {
        const toCreate = [];

        for (let i = 0; i < n; i++) {
            const color = getTeamColor();
            const [name, prefix] = getTeamName();

            //Promise SEQUENCE
            //          Role
            //      CategoryChannel
            //  txtChannel, voiceChannel
            //          Team
            const chained = g.roles.create({
                data: {
                    name: prefix,
                    color: color,
                },
            }).then((teamRole) => {
                const ROLE_CHANNEL_PERMS: PermissionResolvable[] = ["CREATE_INSTANT_INVITE", "VIEW_CHANNEL"];
                const permissionOverwrites = [{
                    id: g.roles.everyone,
                    deny: ROLE_CHANNEL_PERMS
                },
                {
                    id: teamRole,
                    allow: ROLE_CHANNEL_PERMS
                }]

                return g.channels.create(prefix, {
                    type: 'category',
                    nsfw: true,
                    permissionOverwrites

                }).then((catChannel) =>
                    Promise.all(
                        [g.channels.create(prefix, {
                            type: "text",
                            nsfw: true,
                            parent: catChannel,
                            permissionOverwrites
                        }),
                        g.channels.create(prefix, {
                            type: "voice",
                            nsfw: true,
                            parent: catChannel,
                            permissionOverwrites
                        })]
                    ).then(([txtChannel, voiceChannel]) =>
                        Team.create({
                            color,
                            name,
                            prefix,
                            gid: g.id,
                            indexedName: `Team no. ${i + 1}`,
                            role_id: teamRole.id,
                            text_cid: txtChannel.id,
                            voice_cid: voiceChannel.id,
                            category_cid: txtChannel.parentID!
                        }))
                )

            }
            )
            toCreate.push(chained)
        }
        return Promise.all(toCreate);
    }


    disband(g: dGuild) {
        return this.reload({
            include: [TeamPlayer]
        }).then((rloaded) => {
            const channelIDs = [rloaded.text_cid, rloaded.voice_cid, rloaded.category_cid]
            return Promise.all(
                channelIDs.map(cid =>
                    g.channels.cache.get(cid)?.delete().catch(_ => Promise.resolve())))
                .then(() =>
                    g.roles.cache.get(rloaded.role_id)?.delete().catch(_ => Promise.resolve())
                )
                .then(() => Promise.all(rloaded.members.map(m => m.disband(g))))
                .then(() => rloaded.destroy())
        })
    }
}
