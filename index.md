---
layout: default
description: |
    I am a first year PhD student in the [School of Computing](https://cs.kaist.ac.kr/){:target="_blank"} at [KAIST](https://www.kaist.ac.kr/){:target="_blank"}. I work with [Juho Kim](https://juhokim.com/){:target="_blank"} as a member of [KIXLAB](https://www.kixlab.org/){:target="_blank"}.

    I'm interested in the intersection of human-computer interaction (<b>HCI</b>) and artificial intelligence (<b>AI</b>). I design interaction techniques powered by machine learning models that enable and facilitate <b>intent-driven creation</b> (e.g., designing, writing).
---

## Publications

#### Conference Papers

<div>
{% for paper in site.data.papers %}
    <div class="paper-cont">
        <div class="paper-img-cont" style="background-image:url({{paper.img | relative_url}})"></div>
        <div style="flex:1">
            <div class="paper-line"><a href="{{paper.url}}" target="_blank">{{paper.title}}</a></div>
            <div class="paper-line">
                {% for author in paper.authors %}
                    {% if author.name == "Tae Soo Kim" %}
                        <strong>{{author.name}}</strong>{% if forloop.last != true %}, {% endif %}
                    {% else %}
                        {% if author.url %}
                            <a href="{{author.url}}" target="_blank">{{author.name}}</a>{% if forloop.last != true %}, {% endif %}
                        {% else %}
                            {{author.name}}{% if forloop.last != true %}, {% endif %}
                        {% endif %}
                    {% endif %}
                {% endfor %}
            </div>
            <div class="paper-line">
                <span class="paper-deets">{{paper.conference}} {% if paper.toappear %}(to appear) {% endif %}</span>
                {% if paper.website %}<span class="paper-deets"><a href="{{paper.website}}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i>Website</a></span>{% endif %}
                {% if paper.video %}<span class="paper-deets"><a href="{{paper.video}}" target="_blank"><i class="fa-brands fa-youtube"></i>Video</a></span>{% endif %}
                {% if paper.acmdl %}<span class="paper-deets"><a href="{{paper.acmdl}}" target="_blank"><i class="ai ai-acmdl"></i>ACM DL</a></span>{% endif %}
            </div>
            {% if paper.award %}
            <div class="paper-line">
                <span class="award"><i class="fa-solid fa-medal" style="margin-right: 4px"></i>{{paper.award}}</span>
            </div>
            {% endif %}
        </div>
    </div>
{% endfor %}
</div>

#### Posters, Demos, Workshop Papers

<div>
{% for paper in site.data.posters %}
    <div class="poster-cont">
        <div class="paper-line"><a href="{{paper.url}}" target="_blank">{{paper.title}}</a></div>
        <div class="paper-line">
            {% for author in paper.authors %}
                {% if author.name == "Tae Soo Kim" %}
                    <strong>{{author.name}}</strong>{% if forloop.last != true %}, {% endif %}
                {% else %}
                    {% if author.url %}
                        <a href="{{author.url}}" target="_blank">{{author.name}}</a>{% if forloop.last != true %}, {% endif %}
                    {% else %}
                        {{author.name}}{% if forloop.last != true %}, {% endif %}
                    {% endif %}
                {% endif %}
            {% endfor %}
        </div>
        <div class="paper-line">
            <span class="paper-deets">{{paper.conference}} {% if paper.toappear %}(to appear) {% endif %}</span>
            {% if paper.website %}<span class="paper-deets"><a href="{{paper.website}}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i>Website</a></span>{% endif %}
            {% if paper.video %}<span class="paper-deets"><a href="{{paper.video}}" target="_blank"><i class="fa-brands fa-youtube"></i>Video</a></span>{% endif %}
            {% if paper.acmdl %}<span class="paper-deets"><a href="{{paper.acmdl}}" target="_blank"><i class="ai ai-acmdl"></i>ACM DL</a></span>{% endif %}
        </div>
        {% if paper.award %}
        <div class="paper-line">
            <span class="award"><i class="fa-solid fa-medal" style="margin-right: 4px"></i>{{paper.award}}</span>
        </div>
        {% endif %}
    </div>
{% endfor %}
</div>

## Services

<b>Student Volunteer:</b> UIST 2021

<b>Reviewer:</b> CHI 2022, CHI 2021 LBW, CSCW2020
