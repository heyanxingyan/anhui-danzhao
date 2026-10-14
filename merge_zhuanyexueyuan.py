# -*- coding: utf-8 -*-
"""合并5组采集的高职专业学院数据，更新 zhongzhi_lianhe.json"""
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
DC = os.path.join(ROOT, 'data-collection')

# ===== 1. 合肥公办组（已生成文件）=====
with open(os.path.join(ROOT, 'gaozhi-zhuanyexueyuan-2026.json'), 'r', encoding='utf-8') as f:
    hefei_data = json.load(f)

# ===== 2. 皖北组 =====
wanbei_data = [
    {"gaozhiSchool": "淮南联合大学", "zhongzhiSchool": "阜阳职业技术学校", "major": "应用化工技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "安徽省阜阳市颍东区（阜阳职业技术学校）", "source": "https://www.ahzsks.cn/pic/file/20260310/20260310185903_776.pdf"},
    {"gaozhiSchool": "淮南职业技术学院", "zhongzhiSchool": "阜阳科技工程学校", "major": "机电一体化技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "安徽省阜阳市界首市陶庙镇学府路1号（阜阳科技工程学校）", "source": "https://zsxxw.hnvtc.edu.cn/info/1060/2270.htm"},
    {"gaozhiSchool": "淮南职业技术学院", "zhongzhiSchool": "阜阳科技工程学校", "major": "新能源汽车技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "安徽省阜阳市界首市陶庙镇学府路1号（阜阳科技工程学校）", "source": "https://zsxxw.hnvtc.edu.cn/info/1060/2270.htm"},
    {"gaozhiSchool": "宿州职业技术学院", "zhongzhiSchool": "灵璧县高级职业技术学校", "major": "机电一体化技术", "plan2026": 70, "fee": "按省价格主管部门核定标准执行", "location": "安徽省宿州市灵璧县钟灵大道西延伸段", "source": "https://szzy.edu.cn/zsxxw/629/info.aspx?itemid=51126"},
    {"gaozhiSchool": "宿州职业技术学院", "zhongzhiSchool": "宿州工业学校", "major": "汽车检测与维修技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "安徽省宿州市教育园区凤至路500号", "source": "https://szzy.edu.cn/zsxxw/629/info.aspx?itemid=51126"},
    {"gaozhiSchool": "亳州职业技术学院", "zhongzhiSchool": "安徽中药科技学校", "major": "中药学", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "安徽省亳州市高新区莲花路1号（安徽中药科技学校）", "source": "https://www.ahzsks.cn/zyyx/8723.htm"},
    {"gaozhiSchool": "亳州职业技术学院", "zhongzhiSchool": "安徽中药科技学校", "major": "中药制药", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "安徽省亳州市高新区莲花路1号（安徽中药科技学校）", "source": "https://www.ahzsks.cn/zyyx/8723.htm"},
    {"gaozhiSchool": "安徽电子信息职业技术学院", "zhongzhiSchool": "宣城市信息工程学校", "major": "计算机应用技术", "plan2026": 100, "fee": "按省价格主管部门核定标准执行", "location": "安徽省宣城市梅溪路902号（宣城市信息工程学校）", "source": "https://www.ahdy.edu.cn/zsxx/_t67/2026/0310/c927a44240/page.htm"},
]

# ===== 3. 皖南组 =====
wannan_data = [
    {"gaozhiSchool": "芜湖职业技术大学", "zhongzhiSchool": "天长市工业学校", "major": "数控技术", "plan2026": 70, "fee": "按省价格主管部门核定标准执行", "location": "天长市西城经济开发区纬三路18号", "source": "https://www.ahzsks.cn/pic/file/20260310/20260310185220_417.pdf"},
    {"gaozhiSchool": "芜湖职业技术大学", "zhongzhiSchool": "淮南经济技术学校", "major": "电气自动化技术", "plan2026": 60, "fee": "按省价格主管部门核定标准执行", "location": "淮南市山南新区职教园", "source": "https://www.ahzsks.cn/pic/file/20260310/20260310185220_417.pdf"},
    {"gaozhiSchool": "芜湖职业技术大学", "zhongzhiSchool": "阜阳科技工程学校", "major": "物联网应用技术", "plan2026": 40, "fee": "按省价格主管部门核定标准执行", "location": "界首市界光路160号", "source": "https://www.ahzsks.cn/pic/file/20260310/20260310185220_417.pdf"},
    {"gaozhiSchool": "芜湖职业技术大学", "zhongzhiSchool": "宣城市机械电子工程学校", "major": "智能制造装备技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "广德市祠山街道团结西路77号", "source": "https://www.ahzsks.cn/pic/file/20260310/20260310185220_417.pdf"},
    {"gaozhiSchool": "安徽机电职业技术学院", "zhongzhiSchool": "安徽材料工程学校", "major": "数控技术", "plan2026": 100, "fee": "按省价格主管部门核定标准执行", "location": "宁国市汪溪办事处落花荡路99号", "source": "https://zs.ahcme.edu.cn/info/1077/3627.htm"},
    {"gaozhiSchool": "安徽机电职业技术学院", "zhongzhiSchool": "安徽材料工程学校", "major": "工业机器人技术", "plan2026": 100, "fee": "按省价格主管部门核定标准执行", "location": "宁国市汪溪办事处落花荡路99号", "source": "https://zs.ahcme.edu.cn/info/1077/3627.htm"},
    {"gaozhiSchool": "安徽机电职业技术学院", "zhongzhiSchool": "安徽材料工程学校", "major": "电子商务", "plan2026": 100, "fee": "按省价格主管部门核定标准执行", "location": "宁国市汪溪办事处落花荡路99号", "source": "https://zs.ahcme.edu.cn/info/1077/3627.htm"},
    {"gaozhiSchool": "安徽机电职业技术学院", "zhongzhiSchool": "安徽省蒙城建筑工业中等专业学校", "major": "数控技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "亳州市蒙城县濮水路241号", "source": "https://zs.ahcme.edu.cn/info/1077/3627.htm"},
    {"gaozhiSchool": "安徽机电职业技术学院", "zhongzhiSchool": "安徽省蒙城建筑工业中等专业学校", "major": "机电一体化技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "亳州市蒙城县濮水路241号", "source": "https://zs.ahcme.edu.cn/info/1077/3627.htm"},
    {"gaozhiSchool": "安徽机电职业技术学院", "zhongzhiSchool": "滁州市应用技术学校", "major": "机电一体化技术", "plan2026": 100, "fee": "按省价格主管部门核定标准执行", "location": "滁州市全椒县襄河镇大石潭路999号", "source": "https://zs.ahcme.edu.cn/info/1077/3627.htm"},
    {"gaozhiSchool": "安徽商贸职业技术学院", "zhongzhiSchool": "皖北经济技术学校", "major": "跨境电子商务", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "临泉县霞光大道398号", "source": "https://www.ahzsks.cn/pic/file/20260310/20260310191804_438.pdf"},
    {"gaozhiSchool": "安徽商贸职业技术学院", "zhongzhiSchool": "皖北经济技术学校", "major": "大数据与会计", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "临泉县霞光大道398号", "source": "https://www.ahzsks.cn/pic/file/20260310/20260310191804_438.pdf"},
    {"gaozhiSchool": "安徽商贸职业技术学院", "zhongzhiSchool": "安徽理工学校", "major": "计算机网络技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "安庆市十狮路106号", "source": "https://www.ahzsks.cn/pic/file/20260310/20260310191804_438.pdf"},
    {"gaozhiSchool": "安徽商贸职业技术学院", "zhongzhiSchool": "安徽材料工程学校", "major": "电子信息工程技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "宁国市汪溪办事处落花荡路99号", "source": "https://www.ahzsks.cn/pic/file/20260310/20260310191804_438.pdf"},
    {"gaozhiSchool": "马鞍山职业技术学院", "zhongzhiSchool": "马鞍山理工学校", "major": "汽车检测与维修技术", "plan2026": 95, "fee": "按省价格主管部门核定标准执行", "location": "安徽省马鞍山市雨山区霍里山中路326号", "source": "https://zsb.mastc.edu.cn/info/1012/5811.htm"},
    {"gaozhiSchool": "马鞍山职业技术学院", "zhongzhiSchool": "当涂经贸学校", "major": "电气自动化技术", "plan2026": 45, "fee": "按省价格主管部门核定标准执行", "location": "安徽省马鞍山市当涂县太白东路1号", "source": "https://zsb.mastc.edu.cn/info/1012/5811.htm"},
    {"gaozhiSchool": "宣城职业技术学院", "zhongzhiSchool": "宣城市工业学校", "major": "智能制造装备技术", "plan2026": 60, "fee": "按省价格主管部门核定标准执行", "location": "安徽省宣城市泾县泾川镇北郊青狮路1号", "source": "https://zs.xcvtc.edu.cn/"},
    {"gaozhiSchool": "宣城职业技术学院", "zhongzhiSchool": "宣城市信息工程学校", "major": "机电一体化技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "宣城市经济技术开发区梅溪路902号", "source": "https://zs.xcvtc.edu.cn/"},
    {"gaozhiSchool": "黄山职业技术学院", "zhongzhiSchool": "安徽省行知学校", "major": "电气自动化技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "黄山市歙县歙州大道", "source": "https://www.gx211.cn/ueditor/php/upload/video/20260312/1773283065387287.pdf"},
    {"gaozhiSchool": "黄山职业技术学院", "zhongzhiSchool": "安徽省行知学校", "major": "大数据与会计", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "黄山市歙县歙州大道", "source": "https://www.gx211.cn/ueditor/php/upload/video/20260312/1773283065387287.pdf"},
    {"gaozhiSchool": "黄山职业技术学院", "zhongzhiSchool": "黄山旅游管理学校", "major": "旅游管理", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "安徽省黄山市黄山区仙源东路S322省道东侧", "source": "https://www.gx211.cn/ueditor/php/upload/video/20260312/1773283065387287.pdf"},
    {"gaozhiSchool": "黄山职业技术学院", "zhongzhiSchool": "黄山旅游管理学校", "major": "烹饪工艺与营养", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "安徽省黄山市黄山区仙源东路S322省道东侧", "source": "https://www.gx211.cn/ueditor/php/upload/video/20260312/1773283065387287.pdf"},
    {"gaozhiSchool": "池州职业技术学院", "zhongzhiSchool": "安徽交通中等职业技术学校", "major": "机电一体化技术", "plan2026": 90, "fee": "按省价格主管部门核定标准执行", "location": "池州市教育园区牧之路89号", "source": "https://www.czvtc.edu.cn/uploads/file/20260312/1773285507188702.pdf"},
    {"gaozhiSchool": "池州职业技术学院", "zhongzhiSchool": "安徽交通中等职业技术学校", "major": "新能源汽车技术", "plan2026": 45, "fee": "按省价格主管部门核定标准执行", "location": "池州市教育园区牧之路89号", "source": "https://www.czvtc.edu.cn/uploads/file/20260312/1773285507188702.pdf"},
    {"gaozhiSchool": "池州职业技术学院", "zhongzhiSchool": "池州工业学校", "major": "应用化工技术", "plan2026": 40, "fee": "按省价格主管部门核定标准执行", "location": "池州市东至县尧渡镇舜德大道7号", "source": "https://www.czvtc.edu.cn/uploads/file/20260312/1773285507188702.pdf"},
]

# ===== 4. 皖中皖西组 =====
wanzhong_data = [
    {"gaozhiSchool": "安庆职业技术学院", "zhongzhiSchool": "太湖职业技术学校", "major": "机电一体化技术", "plan2026": 30, "fee": "按省价格主管部门核定标准执行", "location": "安庆市太湖县晋熙镇晋湖路340号（太湖职业技术学校）", "source": "https://m.gaokao.cn/school/1836/229033/admission/68002"},
    {"gaozhiSchool": "六安职业技术学院", "zhongzhiSchool": "舒城职业学校", "major": "新能源汽车检测与维修技术", "plan2026": 200, "fee": "按省价格主管部门核定标准执行", "location": "六安市舒城县经开区陈三堰路（舒城职业学校）", "source": "https://zsw.lvtc.edu.cn/2026/0311/c310a58949/pagem.htm"},
    {"gaozhiSchool": "滁州职业技术学院", "zhongzhiSchool": "滁州市信息工程学校", "major": "机电一体化技术", "plan2026": 200, "fee": "按省价格主管部门核定标准执行", "location": "滁州市来安县黎明路45号（滁州市信息工程学校）", "source": "https://zs.chzc.edu.cn/details/article?id=652198"},
    {"gaozhiSchool": "滁州城市职业学院", "zhongzhiSchool": "安徽省淮南卫生学校", "major": "婴幼儿托育服务与管理", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "淮南市山南新区职教园区春申大街1号（淮南卫生学校）", "source": "https://www.ahzsks.cn/pic/file/20260310/20260310190834_51.pdf"},
    {"gaozhiSchool": "滁州城市职业学院", "zhongzhiSchool": "安徽省淮南卫生学校", "major": "助产", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "淮南市山南新区职教园区春申大街1号（淮南卫生学校）", "source": "https://www.ahzsks.cn/pic/file/20260310/20260310190834_51.pdf"},
    {"gaozhiSchool": "安徽国防科技职业学院", "zhongzhiSchool": "合肥理工学校", "major": "机械制造及自动化", "plan2026": 200, "fee": "按省价格主管部门核定标准执行", "location": "合肥市肥东县城双桥（合肥理工学校）", "source": "https://www.acdt.edu.cn/zs/info/1063/3456.htm"},
    {"gaozhiSchool": "安徽国防科技职业学院", "zhongzhiSchool": "安徽科技贸易学校", "major": "计算机网络技术", "plan2026": 100, "fee": "按省价格主管部门核定标准执行", "location": "蚌埠市淮上区龙华路699号（安徽科技贸易学校）", "source": "https://www.acdt.edu.cn/zs/info/1063/3456.htm"},
    {"gaozhiSchool": "安徽国防科技职业学院", "zhongzhiSchool": "安徽科技贸易学校", "major": "计算机应用技术", "plan2026": 95, "fee": "按省价格主管部门核定标准执行", "location": "蚌埠市淮上区龙华路699号（安徽科技贸易学校）", "source": "https://www.acdt.edu.cn/zs/info/1063/3456.htm"},
    {"gaozhiSchool": "安徽国防科技职业学院", "zhongzhiSchool": "皖西经济技术学校", "major": "汽车检测与维修技术", "plan2026": 155, "fee": "按省价格主管部门核定标准执行", "location": "六安市霍邱县蓼东大道58号（皖西经济技术学校）", "source": "https://www.acdt.edu.cn/zs/info/1063/3456.htm"},
    {"gaozhiSchool": "安徽水利水电职业技术学院", "zhongzhiSchool": "皖西经济技术学校", "major": "机电一体化技术", "plan2026": 100, "fee": "按省价格主管部门核定标准执行", "location": "六安市霍邱县蓼东大道58号（皖西经济技术学校）", "source": "https://zsxxw.ahsdxy.edu.cn/info/1006/3928.htm"},
    {"gaozhiSchool": "安徽粮食工程职业学院", "zhongzhiSchool": "安徽省蒙城建筑工业中等专业学校", "major": "食品智能加工技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "亳州市蒙城县濮水路241号（蒙城建筑工业中等专业学校）", "source": "https://www.gx211.cn/ueditor/php/upload/video/20260311/1773195189517371.pdf"},
    {"gaozhiSchool": "安徽工业经济职业技术学院", "zhongzhiSchool": "黄山旅游管理学校", "major": "酒店管理与数字化运营", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "黄山市黄山区仙源东路S322省道东侧（黄山旅游管理学校）", "source": "https://www.ahiec.edu.cn/xxgkw/info/1060/1783.htm"},
    {"gaozhiSchool": "安徽工业经济职业技术学院", "zhongzhiSchool": "黄山旅游管理学校", "major": "计算机网络技术", "plan2026": 50, "fee": "按省价格主管部门核定标准执行", "location": "黄山市黄山区仙源东路S322省道东侧（黄山旅游管理学校）", "source": "https://www.ahiec.edu.cn/xxgkw/info/1060/1783.htm"},
    {"gaozhiSchool": "安徽工业经济职业技术学院", "zhongzhiSchool": "舒城职业学校", "major": "工业机器人技术", "plan2026": 150, "fee": "按省价格主管部门核定标准执行", "location": "六安市舒城县经济技术开发区陈三堰路（舒城职业学校）", "source": "https://www.ahiec.edu.cn/xxgkw/info/1060/1783.htm"},
]

# ===== 合并所有高职专业学院数据 =====
all_zyxy = hefei_data + wanbei_data + wannan_data + wanzhong_data

# 去重（按 gaozhiSchool + zhongzhiSchool + major）
seen = set()
unique_zyxy = []
for item in all_zyxy:
    key = (item['gaozhiSchool'], item['zhongzhiSchool'], item['major'])
    if key not in seen:
        seen.add(key)
        unique_zyxy.append(item)

print(f"合并前: {len(all_zyxy)} 条")
print(f"去重后: {len(unique_zyxy)} 条")

# 按高职院校排序
unique_zyxy.sort(key=lambda x: (x['gaozhiSchool'], x['zhongzhiSchool'], x['major']))

# 保存合并后的高职专业学院数据
with open(os.path.join(DC, 'zhuanyexueyuan_merged.json'), 'w', encoding='utf-8') as f:
    json.dump(unique_zyxy, f, ensure_ascii=False, indent=2)
print(f"已保存: {os.path.join(DC, 'zhuanyexueyuan_merged.json')}")

# 统计
schools = set(item['gaozhiSchool'] for item in unique_zyxy)
zhongzhi = set(item['zhongzhiSchool'] for item in unique_zyxy)
total_plan = sum(item.get('plan2026', 0) or 0 for item in unique_zyxy)
print(f"涉及高职院校: {len(schools)} 所")
print(f"涉及中职学校: {len(zhongzhi)} 所")
print(f"总招生计划: {total_plan} 人")

# ===== 更新 zhongzhi_lianhe.json =====
with open(os.path.join(DC, 'zhongzhi_lianhe.json'), 'r', encoding='utf-8') as f:
    zhongzhi_data = json.load(f)

# 保留原有的3+2/3+4等贯通数据，新增高职专业学院数据（带mode标记）
existing_majors = zhongzhi_data.get('lianheMajors', [])

# 移除原有的模糊"高职专业学院"条目（只有2条，信息不完整）
old_zyxy = [m for m in existing_majors if m.get('mode') == '高职专业学院']
other_majors = [m for m in existing_majors if m.get('mode') != '高职专业学院']

print(f"\n原有联合培养数据: {len(existing_majors)} 条")
print(f"其中高职专业学院(旧): {len(old_zyxy)} 条")
print(f"其他模式(3+2/3+4等): {len(other_majors)} 条")

# 构建新的高职专业学院条目
new_zyxy_majors = []
for item in unique_zyxy:
    new_zyxy_majors.append({
        "gaozhiSchool": item['gaozhiSchool'],
        "zhongzhiSchool": item['zhongzhiSchool'],
        "major": item['major'],
        "mode": "高职专业学院",
        "plan2026": item.get('plan2026'),
        "fee": item.get('fee', ''),
        "location": item.get('location', ''),
        "source": item.get('source', '')
    })

# 合并：高职专业学院放前面
zhongzhi_data['lianheMajors'] = new_zyxy_majors + other_majors

with open(os.path.join(DC, 'zhongzhi_lianhe.json'), 'w', encoding='utf-8') as f:
    json.dump(zhongzhi_data, f, ensure_ascii=False, indent=2)

print(f"\n更新后 lianheMajors: {len(zhongzhi_data['lianheMajors'])} 条")
print(f"  高职专业学院: {len(new_zyxy_majors)} 条")
print(f"  其他模式: {len(other_majors)} 条")
print("完成！")
