import { ActivityReject } from '../../../../shared/models/activitypub/activity'
import { sequelizeTypescript } from '../../../initializers'
import { ActorModel } from '../../../models/activitypub/actor'
import { ActorFollowModel } from '../../../models/activitypub/actor-follow'

async function processRejectActivity (activity: ActivityReject, inboxActor?: ActorModel) {
  if (inboxActor === undefined) throw new Error('Need to reject on explicit inbox.')

  const targetActor = await ActorModel.loadByUrl(activity.actor)

  return processReject(inboxActor, targetActor)
}

// ---------------------------------------------------------------------------

export {
  processRejectActivity
}

// ---------------------------------------------------------------------------

async function processReject (actor: ActorModel, targetActor: ActorModel) {
  return sequelizeTypescript.transaction(async t => {
    const actorFollow = await ActorFollowModel.loadByActorAndTarget(actor.id, targetActor.id, t)

    if (!actorFollow) throw new Error(`'Unknown actor follow ${actor.id} -> ${targetActor.id}.`)

    await actorFollow.destroy({ transaction: t })

    return undefined
  })
}
