import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Resource from '../models/Resource.js';
import Thread from '../models/Thread.js';
import Message from '../models/Message.js';
import Snippet from '../models/Snippet.js';
import Solution from '../models/Solution.js';
import Learning from '../models/Learning.js';

function isMember(project, userId){
  return project.members?.some(m => String(m.user) === String(userId));
}

export async function projectStats(req, res){
  try {
    const { id } = req.params; // project id
    const project = await Project.findById(id).select('members');
    if (!project) return res.status(404).json({ ok:false, error:'Project not found' });
    if (!isMember(project, req.user.id)) return res.status(403).json({ ok:false, error:'Forbidden' });

    const [
      totalTasks,
      doneTasks,
      inProgTasks,
      todoTasks,
      resourceCount,
      threadCount,
      messageCount,
      snippetCount,
      solutionCount,
      learningCount
    ] = await Promise.all([
      Task.countDocuments({ project: id }),
      Task.countDocuments({ project: id, status: 'done' }),
      Task.countDocuments({ project: id, status: 'in-progress' }),
      Task.countDocuments({ project: id, status: 'todo' }),
      Resource.countDocuments({ project: id }),
      Thread.countDocuments({ project: id }),
      Message.countDocuments({ thread: { $in: await Thread.find({ project: id }).distinct('_id') } }),
      Snippet.countDocuments({ project: id }),
      Solution.countDocuments({ project: id }),
      Learning.countDocuments({ project: id })
    ]);

    res.json({ ok:true, stats: {
      tasks: { total: totalTasks, done: doneTasks, inProgress: inProgTasks, todo: todoTasks },
      resources: resourceCount,
      threads: threadCount,
      messages: messageCount,
      snippets: snippetCount,
      solutions: solutionCount,
      learning: learningCount
    }});
  } catch (e) {
    res.status(500).json({ ok:false, error:'Stats failed' });
  }
}
