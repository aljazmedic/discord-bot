import { resolve } from 'bluebird'

import { GuildMember, Guild as dGuild } from "discord.js";
import { BelongsTo, Column, Table, Model, ForeignKey, DataType, Default } from "sequelize-typescript";
import { TeamDB } from ".";
import Team from "./Team.model";

@Table({ timestamps: false, charset: 'utf8', collate: 'utf8_general_ci' })
export default class TeamPlayer extends Model {


    @Column(DataType.STRING)
    public member_id: string

    @BelongsTo(() => Team, { foreignKey: 'team_id' })
    public team: Team;

    @ForeignKey(() => Team)
    @Column(DataType.INTEGER)
    public team_id: number;

    @Column({ type: DataType.STRING })
    public previous_name: string;

    @Column({ type: DataType.STRING })
    public new_name: string;

    @Default(false)
    @Column(DataType.BOOLEAN)
    public isPlayer: boolean;

    static fromEntity(team: Team, entity: string): Promise<TeamPlayer> {
        //Used to store team members that 'are' only a 'string' 
        return TeamPlayer.create({
            member_id: "e_" + Date.now(),
            team_id: team.id,
            new_name: entity
        });
    }

    static fromGuildMember(team: Team, player: GuildMember): Promise<TeamPlayer> {
        //sets Nicknames to team players, saves the change to SQL DB, if 
        //promise was fulfilled
        const previous_name = player.nickname || player.user.username;
        const teamMember: TeamMember = {
            previous_name,
            new_name: `${team.prefix} ${previous_name}`,
            team_id: team.id,
            member_id: player.user.id,
            isPlayer: true
        }

        //Promise SEQUENCE
        //        addRole
        //     changeNickname
        //    create TeamPlayer
        if (player.id == player.guild.owner?.id) {
            console.log("MEMBER IS OWNER!")
            return TeamPlayer.create(teamMember);
        }
        return Promise
            .resolve(player.guild.roles.cache.get(team.role_id)) //kickstart the promise chain
            .then(r => {
                if (!r) return Promise.resolve(undefined)
                return player.roles.add(r)
            }).then((a) => {
                return player
                    .setNickname(teamMember.new_name)
            })
            .then(() => TeamPlayer.create(teamMember))


    }

    disband(g: dGuild): Promise<void> {
        //If only an entity aka. string just auto-destroy
        if (!this.isPlayer)
            return this.destroy()

        //Promise SEQUENCE
        //      reload TeamPlayer w/ Team
        //    restoreNickname | justForward
        //             remove Role       
        return this.reload({
            include: [TeamDB]
        }).then((rloaded) => {
            const member = g.member(rloaded.member_id)
            if (!member) throw Error(`No such member: ${rloaded.member_id} in guild ${g.id}`);
            const currentName = member.nickname || member.user.username;
            if (currentName != this.new_name || member.id == g.owner?.id) {
                return Promise.resolve(member);
            } else {
                return member.setNickname(this.previous_name);
            }
        }).then((member) => {
            const role = g.roles.cache.get(this.team.role_id);
            if (member.id == g.owner?.id || !role)
                return Promise.resolve(member);
            else
                return member.roles
                    .remove(role)
        })
            .then(() =>
                this.destroy()
            )
    }
}

type TeamMember = {
    previous_name: string;
    new_name: string;
    team_id: number;
    member_id: string;
    isPlayer: boolean;
}