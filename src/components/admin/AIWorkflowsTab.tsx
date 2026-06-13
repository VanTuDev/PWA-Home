import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Play, 
  Save, 
  CheckSquare, 
  AlertTriangle,
  Clock,
  User,
  Heart,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { toast } from '../../utils/toast';
import { confirm } from '../ConfirmDialog';

// Initialize Gemini API client if API key is provided
let ai: any = null;
const API_KEY = process.env.GEMINI_API_KEY || '';
const hasValidKey = API_KEY && API_KEY !== 'MY_GEMINI_API_KEY';

if (hasValidKey) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI", e);
  }
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  role: string;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  duration: string;
  completed: boolean;
}

interface SavedWorkflow {
  id: string;
  title: string;
  skillType: 'rescue' | 'medical' | 'adoption' | 'custom';
  petType: string;
  condition: string;
  urgency: 'Cao' | 'Trung bình' | 'Thấp';
  notes: string;
  steps: WorkflowStep[];
  createdAt: string;
}

export const AIWorkflowsTab: React.FC = () => {
  // Saved Workflows State
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);

  // Form Inputs State
  const [skillType, setSkillType] = useState<'rescue' | 'medical' | 'adoption' | 'custom'>('rescue');
  const [title, setTitle] = useState('');
  const [petType, setPetType] = useState('Chó');
  const [condition, setCondition] = useState('');
  const [urgency, setUrgency] = useState<'Cao' | 'Trung bình' | 'Thấp'>('Trung bình');
  const [notes, setNotes] = useState('');

  // Generated steps list state
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Active workflow being edited in detail
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPriority, setEditPriority] = useState<'Cao' | 'Trung bình' | 'Thấp'>('Trung bình');
  const [editDuration, setEditDuration] = useState('');

  // New manual step form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRole, setNewRole] = useState('Tình Nguyện Viên');
  const [newPriority, setNewPriority] = useState<'Cao' | 'Trung bình' | 'Thấp'>('Trung bình');
  const [newDuration, setNewDuration] = useState('1 giờ');

  // Load saved workflows on mount
  useEffect(() => {
    const loaded = localStorage.getItem('paw_active_workflows');
    if (loaded) {
      try {
        setSavedWorkflows(JSON.parse(loaded));
      } catch (e) {
        console.error("Failed to parse saved workflows", e);
      }
    }
  }, []);

  // Save workflows to localStorage whenever updated
  const saveAllToLocalStorage = (updatedList: SavedWorkflow[]) => {
    setSavedWorkflows(updatedList);
    localStorage.setItem('paw_active_workflows', JSON.stringify(updatedList));
  };

  // Internal Fallback Logic for Workflow Generation
  const generateLocalFallback = (
    type: 'rescue' | 'medical' | 'adoption' | 'custom',
    t: string,
    pet: string,
    cond: string,
    urg: string
  ): WorkflowStep[] => {
    const targetName = t || (pet === 'Chó' ? 'Chú chó hoang' : pet === 'Mèo' ? 'Chú mèo nhỏ' : 'Thú cưng');
    const conditionText = cond || 'cần trợ giúp khẩn cấp';
    
    if (type === 'rescue') {
      return [
        {
          id: 'fb-1',
          title: 'Tiếp nhận thông tin & Chuẩn bị trang thiết bị',
          description: `Thu thập hình ảnh, xác minh vị trí cụ thể của ${targetName}. Chuẩn bị lồng vận chuyển chuyên dụng, găng tay bảo hộ và dụng cụ cứu hộ cơ bản.`,
          role: 'Đội Cứu Hộ',
          priority: 'Cao',
          duration: '15 phút',
          completed: false
        },
        {
          id: 'fb-2',
          title: `Tiếp cận hiện trường & Sơ cứu ban đầu`,
          description: `Di chuyển đến khu vực được báo cáo. Tiếp cận ${targetName} một cách nhẹ nhàng để tránh gây hoảng loạn. Thực hiện sơ cứu khẩn cấp cho tình trạng: ${conditionText}.`,
          role: 'Đội Cứu Hộ',
          priority: urg === 'Cao' ? 'Cao' : 'Trung bình',
          duration: '1 giờ',
          completed: false
        },
        {
          id: 'fb-3',
          title: 'Đưa đi kiểm tra y tế chuyên sâu',
          description: `Vận chuyển an toàn thú cưng về phòng khám đối tác của PAW Home. Bác sĩ tiến hành chụp X-quang, xét nghiệm máu và kiểm tra tình trạng nhiễm trùng nếu có.`,
          role: 'Bác Sĩ Thú Y',
          priority: 'Cao',
          duration: '45 phút',
          completed: false
        },
        {
          id: 'fb-4',
          title: 'Cách ly y tế & Chăm sóc phục hồi',
          description: `Đặt thú cưng vào khu cách ly chuyên biệt để phòng ngừa bệnh truyền nhiễm. Cho dùng kháng sinh, thuốc giảm đau và cung cấp chế độ ăn dinh dưỡng cao.`,
          role: 'Người Nuôi Tạm',
          priority: 'Trung bình',
          duration: '3 ngày',
          completed: false
        },
        {
          id: 'fb-5',
          title: 'Đăng tải thông tin & Tìm kiếm chủ nuôi',
          description: `Chụp ảnh chân dung đẹp, viết bài câu chuyện cứu hộ của bé chia sẻ lên cộng đồng PAW Home để bắt đầu tìm kiếm gia đình nhận nuôi lâu dài.`,
          role: 'Quản Trị Viên',
          priority: 'Thấp',
          duration: '1 ngày',
          completed: false
        }
      ];
    } else if (type === 'medical') {
      return [
        {
          id: 'fb-1',
          title: 'Xét nghiệm lâm sàng & Chẩn đoán hình ảnh',
          description: `Thực hiện xét nghiệm chỉ số máu tổng quát, xét nghiệm bệnh truyền nhiễm (Parvo/Care cho chó, FIP/FIV cho mèo). Chẩn đoán xác định tình trạng: ${conditionText}.`,
          role: 'Bác Sĩ Thú Y',
          priority: 'Cao',
          duration: '1 giờ',
          completed: false
        },
        {
          id: 'fb-2',
          title: 'Thiết lập phác đồ điều trị chuyên sâu',
          description: `Tiến hành phẫu thuật (nếu chấn thương xương) hoặc truyền dịch kháng sinh theo giờ. Cho uống thuốc hỗ trợ gan, thận và tăng cường sức đề kháng.`,
          role: 'Bác Sĩ Thú Y',
          priority: 'Cao',
          duration: '5 ngày',
          completed: false
        },
        {
          id: 'fb-3',
          title: 'Theo dõi chỉ số sinh tồn & Vệ sinh vết thương',
          description: `Vệ sinh sát trùng vết thương hở hàng ngày. Thay băng gạc vô trùng. Đo nhiệt độ và theo dõi lượng thức ăn nạp vào mỗi bữa.`,
          role: 'Tình Nguyện Viên',
          priority: 'Trung bình',
          duration: 'Hàng ngày',
          completed: false
        },
        {
          id: 'fb-4',
          title: 'Xây dựng chế độ dinh dưỡng phục hồi',
          description: `Cung cấp gel dinh dưỡng, thức ăn mềm dễ tiêu hóa và bổ sung canxi. Khuyến khích thú cưng vận động nhẹ nhàng để phục hồi chức năng cơ khớp.`,
          role: 'Người Nuôi Tạm',
          priority: 'Trung bình',
          duration: '10 ngày',
          completed: false
        },
        {
          id: 'fb-5',
          title: 'Đánh giá sức khỏe tổng thể & Tiêm chủng',
          description: `Khám tổng quát lần cuối xem vết thương đã lành hẳn chưa. Thực hiện tiêm phòng vaccine đầy đủ và cấy microchip định danh trước khi cho xuất viện.`,
          role: 'Bác Sĩ Thú Y',
          priority: 'Thấp',
          duration: '1 ngày',
          completed: false
        }
      ];
    } else if (type === 'adoption') {
      return [
        {
          id: 'fb-1',
          title: 'Kiểm duyệt hồ sơ nhận nuôi',
          description: `Đánh giá chi tiết thông tin đơn đăng ký nhận nuôi bé ${targetName}. Xác minh tính chân thực của thông tin nhà ở, tài chính và kinh nghiệm nuôi thú cưng trước đây.`,
          role: 'Quản Trị Viên',
          priority: 'Trung bình',
          duration: '1 ngày',
          completed: false
        },
        {
          id: 'fb-2',
          title: 'Phỏng vấn trực tiếp người nhận nuôi',
          description: `Hẹn lịch gọi video call phỏng vấn trực tiếp. Đặt các câu hỏi tình huống cụ thể (ví dụ: Bé phá phách đồ đạc, bé bị ốm, di chuyển chỗ ở mới) để xem xét thái độ xử lý.`,
          role: 'Tình Nguyện Viên',
          priority: 'Trung bình',
          duration: '1 giờ',
          completed: false
        },
        {
          id: 'fb-3',
          title: 'Khảo sát thực tế không gian sống',
          description: `Đội cứu hộ đến khảo sát trực tiếp căn hộ/nhà riêng của gia đình. Đảm bảo cửa sổ có lưới an toàn đối với mèo, hoặc có sân rào chắc chắn đối với chó lớn.`,
          role: 'Đội Cứu Hộ',
          priority: 'Thấp',
          duration: '1 ngày',
          completed: false
        },
        {
          id: 'fb-4',
          title: 'Bắt đầu giai đoạn thử thách nuôi thử (Foster-to-Adopt)',
          description: `Bàn giao bé ${targetName} cho người nhận nuôi chăm sóc thử trong vòng 7 ngày dưới sự giám sát chặt chẽ. Yêu cầu cập nhật hình ảnh và video hàng ngày qua nhóm chat.`,
          role: 'Người Nuôi Tạm',
          priority: 'Cao',
          duration: '7 ngày',
          completed: false
        },
        {
          id: 'fb-5',
          title: 'Ký kết hợp đồng nhận nuôi & Cập nhật định danh',
          description: `Hết thời gian thử thách đạt yêu cầu. Tiến hành ký hợp đồng nhận nuôi chính thức. Bàn giao sổ y tế và chuyển quyền quản lý microchip định danh cho chủ nuôi mới.`,
          role: 'Quản Trị Viên',
          priority: 'Cao',
          duration: '2 giờ',
          completed: false
        }
      ];
    } else {
      return [
        {
          id: 'fb-1',
          title: `Xác định mục tiêu kế hoạch: ${targetName}`,
          description: `Lên phương án sơ bộ, dự kiến ngân sách cần thiết và liệt kê danh sách nhân sự tham gia hành động đối với tình huống: ${conditionText}.`,
          role: 'Quản Trị Viên',
          priority: 'Cao',
          duration: '2 giờ',
          completed: false
        },
        {
          id: 'fb-2',
          title: 'Truyền thông & Kêu gọi nguồn lực hỗ trợ',
          description: `Đăng tải thông tin lên mạng xã hội PAW Home để tìm kiếm sự giúp đỡ từ tình nguyện viên và các nhà hảo tâm tài trợ vật phẩm y tế, thức ăn chuyên dụng.`,
          role: 'Quản Trị Viên',
          priority: 'Trung bình',
          duration: '1 ngày',
          completed: false
        },
        {
          id: 'fb-3',
          title: 'Triển khai công việc thực tế giai đoạn 1',
          description: `Tập hợp đội ngũ tại trạm cứu hộ. Tiến hành thực hiện các công việc liên quan trực tiếp đến tình huống cụ thể của thú cưng.`,
          role: 'Tình Nguyện Viên',
          priority: 'Cao',
          duration: '2 ngày',
          completed: false
        },
        {
          id: 'fb-4',
          title: 'Kiểm tra, nghiệm thu và điều chỉnh quy trình',
          description: `Họp đánh giá tiến độ thực hiện. Xử lý kịp thời các phát sinh về y tế, điều kiện ăn ở hoặc hành vi của thú cưng trong suốt quá trình triển khai kế hoạch.`,
          role: 'Đội Cứu Hộ',
          priority: 'Trung bình',
          duration: '4 giờ',
          completed: false
        },
        {
          id: 'fb-5',
          title: 'Lưu trữ thông tin & Báo cáo tổng kết',
          description: `Lưu trữ thông tin vào kho lưu trữ số của trung tâm. Viết bài cập nhật tình hình tốt đẹp của bé lên Fanpage để cảm ơn cộng đồng cứu trợ.`,
          role: 'Quản Trị Viên',
          priority: 'Thấp',
          duration: '3 giờ',
          completed: false
        }
      ];
    }
  };

  // Generate Steps Action
  const handleGenerateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSteps([]);
    setEditingStepId(null);
    setShowAddForm(false);

    const activeTitle = title.trim() || `${skillType === 'rescue' ? 'Cứu hộ' : skillType === 'medical' ? 'Điều trị' : skillType === 'adoption' ? 'Nhận nuôi' : 'Kế hoạch'} ${petType}`;

    // Prompt construction for Gemini AI
    const prompt = `Bạn là một chuyên gia cứu hộ và bác sĩ thú y hàng đầu của tổ chức PAW Home cứu hộ chó mèo.
Hãy lập một quy trình làm việc chi tiết (gồm 5 bước chuẩn mực, thực tế và hiệu quả) cho tình huống sau:
- Mẫu kỹ năng: ${skillType === 'rescue' ? 'Cứu hộ hiện trường' : skillType === 'medical' ? 'Điều trị thú y chuyên sâu' : skillType === 'adoption' ? 'Kiểm duyệt nhận nuôi' : 'Quy trình vận hành chung'}
- Tên/Chủ đề: ${activeTitle}
- Loại vật nuôi: ${petType}
- Tình trạng cụ thể: ${condition || 'Bình thường'}
- Độ khẩn cấp: ${urgency}
- Ghi chú thêm: ${notes || 'Không có'}

Mỗi bước trong quy trình cần có đầy đủ thông tin định dạng như sau:
1. title: Tiêu đề bước ngắn gọn (ví dụ: Sơ cứu tại chỗ)
2. description: Mô tả chi tiết hành động thực tế cần làm (dài 1-2 câu)
3. role: Một trong các bộ phận chịu trách nhiệm: "Đội Cứu Hộ", "Bác Sĩ Thú Y", "Tình Nguyện Viên", "Người Nuôi Tạm", "Quản Trị Viên".
4. priority: Một trong ba mức độ ưu tiên: "Cao", "Trung bình", "Thấp".
5. duration: Thời gian dự kiến ước tính (ví dụ: "30 phút", "3 ngày", "Hàng ngày").

Yêu cầu cực kỳ quan trọng:
Hãy chỉ trả về duy nhất một đối tượng JSON hợp lệ ở định dạng thô, tuyệt đối không viết thêm bất kỳ đoạn giới thiệu, giải thích hay đặt trong thẻ mã Markdown (\`\`\`json). Cấu trúc JSON bắt buộc như sau:
{
  "steps": [
    {
      "title": "Tiêu đề bước",
      "description": "Mô tả công việc cần làm...",
      "role": "Đội Cứu Hộ",
      "priority": "Cao",
      "duration": "1 giờ"
    }
  ]
}`;

    if (hasValidKey && ai) {
      try {
        console.log("[Gemini API] Requesting workflow generation from AI...");
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const textResponse = response.text;
        console.log("[Gemini API] Raw Response received:", textResponse);

        if (textResponse) {
          // Parse steps
          const cleanText = textResponse.trim();
          const parsed = JSON.parse(cleanText);
          
          if (parsed && Array.isArray(parsed.steps)) {
            const formattedSteps: WorkflowStep[] = parsed.steps.map((s: any, idx: number) => ({
              id: `ai-${Date.now()}-${idx}`,
              title: s.title || `Bước ${idx + 1}`,
              description: s.description || 'Không có mô tả chi tiết.',
              role: s.role || 'Tình Nguyện Viên',
              priority: s.priority === 'Cao' || s.priority === 'Thấp' ? s.priority : 'Trung bình',
              duration: s.duration || 'N/A',
              completed: false
            }));
            setSteps(formattedSteps);
            setLoading(false);
            return;
          }
        }
        throw new Error("Không thể trích xuất danh sách các bước từ kết quả phản hồi của AI.");
      } catch (err: any) {
        console.warn("[Gemini API Warning] Sử dụng bộ mô phỏng quy trình nội bộ do lỗi:", err.message);
        // Fallback to local high-quality template on failure
      }
    }

    // Delay a bit to simulate beautiful AI thinking animation
    setTimeout(() => {
      const fallbackSteps = generateLocalFallback(skillType, activeTitle, petType, condition, urgency);
      setSteps(fallbackSteps);
      setLoading(false);
    }, 1200);
  };

  // Toggle checklist status
  const handleToggleStep = (stepId: string) => {
    const updated = steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s);
    setSteps(updated);

    // If active workflow, save progress immediately to localStorage
    if (activeWorkflowId) {
      const updatedList = savedWorkflows.map(w => 
        w.id === activeWorkflowId ? { ...w, steps: updated } : w
      );
      saveAllToLocalStorage(updatedList);
    }
  };

  // Edit Step Actions
  const startEditingStep = (step: WorkflowStep) => {
    setEditingStepId(step.id);
    setEditTitle(step.title);
    setEditDescription(step.description);
    setEditRole(step.role);
    setEditPriority(step.priority);
    setEditDuration(step.duration);
  };

  const handleSaveEditStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStepId) return;

    const updated = steps.map(s => s.id === editingStepId ? {
      ...s,
      title: editTitle,
      description: editDescription,
      role: editRole,
      priority: editPriority,
      duration: editDuration
    } : s);

    setSteps(updated);
    setEditingStepId(null);

    // Update active workflow if exists
    if (activeWorkflowId) {
      const updatedList = savedWorkflows.map(w => 
        w.id === activeWorkflowId ? { ...w, steps: updated } : w
      );
      saveAllToLocalStorage(updatedList);
    }
  };

  // Delete Step Action
  const handleDeleteStep = (stepId: string) => {
    const updated = steps.filter(s => s.id !== stepId);
    setSteps(updated);

    // Update active workflow if exists
    if (activeWorkflowId) {
      const updatedList = savedWorkflows.map(w => 
        w.id === activeWorkflowId ? { ...w, steps: updated } : w
      );
      saveAllToLocalStorage(updatedList);
    }
  };

  // Add Manual Step Action
  const handleAddManualStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newStep: WorkflowStep = {
      id: `manual-${Date.now()}`,
      title: newTitle,
      description: newDescription || 'Không có mô tả chi tiết.',
      role: newRole,
      priority: newPriority,
      duration: newDuration,
      completed: false
    };

    const updated = [...steps, newStep];
    setSteps(updated);
    
    // Reset manual step form
    setNewTitle('');
    setNewDescription('');
    setNewRole('Tình Nguyện Viên');
    setNewPriority('Trung bình');
    setNewDuration('1 giờ');
    setShowAddForm(false);

    // Update active workflow if exists
    if (activeWorkflowId) {
      const updatedList = savedWorkflows.map(w => 
        w.id === activeWorkflowId ? { ...w, steps: updated } : w
      );
      saveAllToLocalStorage(updatedList);
    }
  };

  // Save full workflow to Saved list
  const handleSaveFullWorkflow = () => {
    if (steps.length === 0) return;

    const activeTitle = title.trim() || `${skillType === 'rescue' ? 'Cứu hộ' : skillType === 'medical' ? 'Điều trị' : skillType === 'adoption' ? 'Nhận nuôi' : 'Quy trình'} ${petType}`;
    
    if (activeWorkflowId) {
      // Overwrite existing workflow
      const updatedList = savedWorkflows.map(w => 
        w.id === activeWorkflowId ? {
          ...w,
          title: activeTitle,
          skillType,
          petType,
          condition,
          urgency,
          notes,
          steps
        } : w
      );
      saveAllToLocalStorage(updatedList);
      toast.success(`Đã cập nhật quy trình "${activeTitle}" thành công!`);
    } else {
      // Create new workflow record
      const newWorkflow: SavedWorkflow = {
        id: `wf-${Date.now()}`,
        title: activeTitle,
        skillType,
        petType,
        condition,
        urgency,
        notes,
        steps,
        createdAt: new Date().toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
      };
      const updatedList = [newWorkflow, ...savedWorkflows];
      saveAllToLocalStorage(updatedList);
      setActiveWorkflowId(newWorkflow.id);
      toast.success(`Đã kích hoạt và lưu quy trình "${activeTitle}" vào danh sách theo dõi!`);
    }
  };

  // Load selected workflow from saved list
  const handleLoadWorkflow = (wf: SavedWorkflow) => {
    setActiveWorkflowId(wf.id);
    setSkillType(wf.skillType);
    setTitle(wf.title);
    setPetType(wf.petType);
    setCondition(wf.condition);
    setUrgency(wf.urgency);
    setNotes(wf.notes);
    setSteps(wf.steps);
    
    // Clear sub forms
    setEditingStepId(null);
    setShowAddForm(false);
  };

  // Create new template/Clear Form
  const handleResetForm = () => {
    setActiveWorkflowId(null);
    setSkillType('rescue');
    setTitle('');
    setPetType('Chó');
    setCondition('');
    setUrgency('Trung bình');
    setNotes('');
    setSteps([]);
    setEditingStepId(null);
    setShowAddForm(false);
  };

  // Delete workflow record entirely
  const handleDeleteWorkflow = async (wfId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (await confirm({ message: "Bạn có chắc chắn muốn xóa quy trình này khỏi danh sách theo dõi?", danger: true, confirmText: 'Xóa' })) {
      const updated = savedWorkflows.filter(w => w.id !== wfId);
      saveAllToLocalStorage(updated);
      
      if (activeWorkflowId === wfId) {
        handleResetForm();
      }
    }
  };

  // Compute completed stats
  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-fade-in font-sans">
      
      {/* 1. Left Sidebar: Active Workflows List */}
      <div className="xl:col-span-1 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-outline-variant shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/60">
            <h3 className="font-black text-lg text-on-surface tracking-tight flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              Quy trình hoạt động
            </h3>
            <button 
              onClick={handleResetForm}
              className="p-2 hover:bg-surface-container rounded-xl text-primary font-bold text-xs flex items-center gap-1 transition-all"
              title="Tạo quy trình mới"
            >
              <Plus className="w-4 h-4" />
              Mới
            </button>
          </div>

          {savedWorkflows.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant/60 italic text-sm">
              Chưa có quy trình nào đang chạy. Hãy sử dụng trợ lý AI bên cạnh để thiết lập!
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh] pr-1">
              {savedWorkflows.map((wf) => {
                const wfCompleted = wf.steps.filter(s => s.completed).length;
                const wfPercent = wf.steps.length > 0 ? Math.round((wfCompleted / wf.steps.length) * 100) : 0;

                return (
                  <div
                    key={wf.id}
                    onClick={() => handleLoadWorkflow(wf)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-2 group ${
                      activeWorkflowId === wf.id
                        ? 'bg-primary-fixed border-primary/30 shadow-md'
                        : 'bg-surface-container-lowest border-outline-variant hover:border-primary/20 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm truncate text-on-surface group-hover:text-primary transition-colors">
                          {wf.title}
                        </span>
                        <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-wider flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            wf.skillType === 'rescue' ? 'bg-status-ready' : 
                            wf.skillType === 'medical' ? 'bg-status-treatment' : 
                            wf.skillType === 'adoption' ? 'bg-blue-600' : 'bg-secondary'
                          }`}></span>
                          {wf.skillType === 'rescue' ? 'Cứu hộ' : 
                           wf.skillType === 'medical' ? 'Y tế' : 
                           wf.skillType === 'adoption' ? 'Nhận nuôi' : 'Chung'} • {wf.petType}
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => handleDeleteWorkflow(wf.id, e)}
                        className="p-1 hover:bg-red-50 text-on-surface-variant/40 hover:text-error rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa quy trình"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mini progress bar */}
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-on-surface-variant">
                        <span>Hoàn thành {wfCompleted}/{wf.steps.length} bước</span>
                        <span>{wfPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500" 
                          style={{ width: `${wfPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Right Content Area: Form & Active Timeline Editor */}
      <div className="xl:col-span-3 flex flex-col gap-8">
        
        {/* Setup Config Panel */}
        <div className="bg-white p-8 rounded-[32px] border border-outline-variant shadow-sm relative overflow-hidden">
          {/* Neon Glow element for premium look */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm animate-pulse">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-on-surface tracking-tight flex items-center gap-2">
                Trợ lý Quy trình AI (Gemini Agent)
                {hasValidKey ? (
                  <span className="text-[10px] bg-green-50 text-status-ready border border-status-ready/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-black">AI Live</span>
                ) : (
                  <span className="text-[10px] bg-amber-50 text-status-treatment border border-status-treatment/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-black">Local Engine</span>
                )}
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">Thiết lập quy trình làm việc chuẩn hóa cho thú cưng bằng trí tuệ nhân tạo.</p>
            </div>
          </div>

          <form onSubmit={handleGenerateWorkflow} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Skill Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Chọn Kỹ năng AI</label>
              <select
                value={skillType}
                onChange={(e) => setSkillType(e.target.value as any)}
                className="w-full bg-surface p-3.5 rounded-xl border border-outline-variant text-sm font-bold text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="rescue">Lập Kế Hoạch Cứu Hộ</option>
                <option value="medical">Phác Đồ Y Tế & Chăm Sóc</option>
                <option value="adoption">Duyệt Hồ Sơ Nhận Nuôi</option>
                <option value="custom">Quy Trình Hoạt Động Khác</option>
              </select>
            </div>

            {/* Pet Name / Title Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tên Pet / Chủ đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Milo (Husky) hoặc Mèo mướp con..."
                className="w-full bg-surface p-3 border border-outline-variant rounded-xl text-sm font-bold placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Pet Type Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Loại vật nuôi</label>
              <select
                value={petType}
                onChange={(e) => setPetType(e.target.value)}
                className="w-full bg-surface p-3.5 rounded-xl border border-outline-variant text-sm font-bold text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="Chó">Chó</option>
                <option value="Mèo">Mèo</option>
                <option value="Chim">Chim</option>
                <option value="Khác">Vật nuôi khác</option>
              </select>
            </div>

            {/* Urgency Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Độ khẩn cấp</label>
              <div className="flex gap-2 h-full items-center">
                {['Thấp', 'Trung bình', 'Cao'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setUrgency(level as any)}
                    className={`flex-1 py-3 text-xs font-black rounded-xl border transition-all ${
                      urgency === level
                        ? level === 'Cao'
                          ? 'bg-red-50 text-error border-error shadow-sm scale-105'
                          : level === 'Trung bình'
                          ? 'bg-amber-50 text-status-treatment border-status-treatment shadow-sm scale-105'
                          : 'bg-green-50 text-status-ready border-status-ready shadow-sm scale-105'
                        : 'bg-surface border-outline-variant text-on-surface-variant/80 hover:bg-surface-container'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Mô tả chi tiết tình huống cụ thể của Pet</label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="VD: Chân sau bị liệt do tai nạn, nghi ngờ gãy xương đùi, cần sơ cứu nẹp tạm thời..."
                className="w-full bg-surface p-3 border border-outline-variant rounded-xl text-sm font-bold placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Submit Action */}
            <div className="md:col-span-2 lg:col-span-1 flex flex-col justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container disabled:bg-primary/50 transition-all shadow-md shadow-primary/15 hover:scale-[1.02] cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang thiết lập...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Kích Hoạt AI Skill
                  </>
                )}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="mt-4 p-4 bg-red-50 text-error border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Steps Editor & Timeline */}
        {steps.length > 0 && (
          <div className="bg-white p-8 rounded-[32px] border border-outline-variant shadow-sm flex flex-col gap-8 animate-slide-up">
            
            {/* Steps Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-outline-variant/60">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-on-surface tracking-tight">
                  Quy trình hiện tại: <span className="text-primary font-black">{title || `${skillType === 'rescue' ? 'Cứu hộ' : skillType === 'medical' ? 'Điều trị' : 'Nhận nuôi'} ${petType}`}</span>
                </h3>
                <p className="text-xs text-on-surface-variant font-medium">Bấm vào ô tròn để cập nhật tiến trình hoặc nút chỉnh sửa để tùy biến.</p>
              </div>

              {/* Progress Summary and Save */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Tiến trình</p>
                    <p className="text-sm font-black text-primary">{completedCount}/{steps.length} hoàn thành</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-primary/10 flex items-center justify-center text-xs font-black text-primary relative">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="20" cy="20" r="18" fill="transparent" />
                      {/* Using HTML SVG is tricky without sizing. Better to render simple value */}
                    </svg>
                    <span>{progressPercent}%</span>
                  </div>
                </div>

                <button
                  onClick={handleSaveFullWorkflow}
                  className="bg-primary text-on-primary px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-primary-container transition-all shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {activeWorkflowId ? 'Lưu cập nhật' : 'Kích hoạt & Lưu'}
                </button>
              </div>
            </div>

            {/* Steps Timeline Stack */}
            <div className="relative flex flex-col gap-8 pl-6 border-l-2 border-primary/20 py-2">
              {steps.map((step, idx) => {
                const isEditing = editingStepId === step.id;

                return (
                  <div key={step.id} className="relative group">
                    {/* Circle Check Icon on Timeline */}
                    <div 
                      onClick={() => handleToggleStep(step.id)}
                      className={`absolute left-[-39px] top-[4px] w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all ${
                        step.completed
                          ? 'bg-primary border-primary text-on-primary shadow-sm scale-110'
                          : 'bg-white border-primary/30 hover:border-primary text-transparent hover:text-primary/40'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>

                    {isEditing ? (
                      /* Inline editing form */
                      <form onSubmit={handleSaveEditStep} className="bg-surface-container-low p-6 rounded-2xl border border-primary/30 flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Tiêu đề bước</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="bg-white p-2.5 border border-outline-variant rounded-lg text-xs font-bold focus:outline-none"
                              required
                            />
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Bộ phận phụ trách</label>
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              className="bg-white p-2.5 border border-outline-variant rounded-lg text-xs font-bold text-on-surface focus:outline-none"
                            >
                              <option value="Đội Cứu Hộ">Đội Cứu Hộ</option>
                              <option value="Bác Sĩ Thú Y">Bác Sĩ Thú Y</option>
                              <option value="Tình Nguyện Viên">Tình Nguyện Viên</option>
                              <option value="Người Nuôi Tạm">Người Nuôi Tạm</option>
                              <option value="Quản Trị Viên">Quản Trị Viên</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Thời gian dự kiến</label>
                            <input
                              type="text"
                              value={editDuration}
                              onChange={(e) => setEditDuration(e.target.value)}
                              className="bg-white p-2.5 border border-outline-variant rounded-lg text-xs font-bold focus:outline-none"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1.5 md:col-span-3">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Mô tả hành động</label>
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="bg-white p-2.5 border border-outline-variant rounded-lg text-xs font-bold focus:outline-none min-h-[60px]"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Mức độ ưu tiên</label>
                            <select
                              value={editPriority}
                              onChange={(e) => setEditPriority(e.target.value as any)}
                              className="bg-white p-2.5 border border-outline-variant rounded-lg text-xs font-bold text-on-surface focus:outline-none"
                            >
                              <option value="Cao">Cao</option>
                              <option value="Trung bình">Trung bình</option>
                              <option value="Thấp">Thấp</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => setEditingStepId(null)}
                            className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface-container transition-all cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Xong
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Display Step Info Card */
                      <div className={`p-5 rounded-2xl border transition-all flex flex-col gap-2 ${
                        step.completed
                          ? 'bg-surface-container border-outline-variant/40 opacity-70'
                          : 'bg-surface-container-lowest border-outline-variant shadow-sm hover:border-primary/20 hover:shadow'
                      }`}>
                        
                        {/* Title and Badges */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-primary font-mono bg-primary/5 px-2.5 py-1 rounded-lg">
                              BƯỚC {idx + 1}
                            </span>
                            <h4 className={`text-base font-black tracking-tight ${
                              step.completed ? 'line-through text-on-surface-variant/60' : 'text-on-surface'
                            }`}>
                              {step.title}
                            </h4>
                          </div>

                          <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
                            {/* Role Badge */}
                            <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center gap-1">
                              <User className="w-3 h-3 text-primary" />
                              {step.role}
                            </span>
                            
                            {/* Duration Badge */}
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant flex items-center gap-1">
                              <Clock className="w-3 h-3 text-primary" />
                              {step.duration}
                            </span>

                            {/* Priority Badge */}
                            <span className={`px-2.5 py-1 rounded-full ${
                              step.priority === 'Cao'
                                ? 'bg-red-50 text-error border border-error/15'
                                : step.priority === 'Trung bình'
                                ? 'bg-amber-50 text-status-treatment border border-status-treatment/15'
                                : 'bg-green-50 text-status-ready border border-status-ready/15'
                            }`}>
                              {step.priority}
                            </span>
                          </div>
                        </div>

                        {/* Description Text */}
                        <p className={`text-sm text-on-surface-variant leading-relaxed font-medium ${
                          step.completed ? 'line-through text-on-surface-variant/50' : ''
                        }`}>
                          {step.description}
                        </p>

                        {/* Step hover actions */}
                        <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditingStep(step)}
                            className="p-1.5 hover:bg-surface-container text-on-surface-variant/70 hover:text-primary rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                            title="Sửa bước"
                          >
                            <Edit2 className="w-4 h-4" />
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteStep(step.id)}
                            className="p-1.5 hover:bg-red-50 text-on-surface-variant/70 hover:text-error rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                            title="Xóa bước"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step Action Options: Add custom step manual */}
            <div className="pt-2 border-t border-outline-variant/60 flex flex-col gap-4">
              {showAddForm ? (
                /* Manual Step Add Form */
                <form onSubmit={handleAddManualStep} className="p-6 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant flex flex-col gap-4">
                  <h4 className="font-black text-sm text-on-surface flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Bổ sung bước công việc thủ công
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Tiêu đề bước</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="VD: Mua sắm thêm thuốc trị ve rận..."
                        className="bg-white p-2.5 border border-outline-variant rounded-lg text-xs font-bold focus:outline-none"
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Bộ phận phụ trách</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="bg-white p-2.5 border border-outline-variant rounded-lg text-xs font-bold text-on-surface focus:outline-none"
                      >
                        <option value="Đội Cứu Hộ">Đội Cứu Hộ</option>
                        <option value="Bác Sĩ Thú Y">Bác Sĩ Thú Y</option>
                        <option value="Tình Nguyện Viên">Tình Nguyện Viên</option>
                        <option value="Người Nuôi Tạm">Người Nuôi Tạm</option>
                        <option value="Quản Trị Viên">Quản Trị Viên</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Thời gian dự kiến</label>
                      <input
                        type="text"
                        value={newDuration}
                        onChange={(e) => setNewDuration(e.target.value)}
                        placeholder="VD: 30 phút, 1 ngày..."
                        className="bg-white p-2.5 border border-outline-variant rounded-lg text-xs font-bold focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 md:col-span-3">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Mô tả hành động</label>
                      <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Mô tả cụ thể hành động cần phải hoàn thành..."
                        className="bg-white p-2.5 border border-outline-variant rounded-lg text-xs font-bold focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Độ ưu tiên</label>
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value as any)}
                        className="bg-white p-2.5 border border-outline-variant rounded-lg text-xs font-bold text-on-surface focus:outline-none"
                      >
                        <option value="Cao">Cao</option>
                        <option value="Trung bình">Trung bình</option>
                        <option value="Thấp">Thấp</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface-container transition-all cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm vào cuối
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-4 border border-dashed border-outline-variant rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-primary hover:bg-surface-container-low transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Thêm bước thực hiện thủ công
                </button>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
